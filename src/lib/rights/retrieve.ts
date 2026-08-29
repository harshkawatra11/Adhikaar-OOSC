// Deterministic lexical retrieval for the Rights Navigator. No vector
// database, no embeddings, no external service: at this corpus size
// (a few dozen chunks) a plain TF-IDF-with-a-phrase-bonus scorer beats
// an embedding pipeline on accuracy, on honesty, and on being a pure
// function every path of which is unit tested below. It needs no API
// key, cannot silently drift as a hosted model changes, and costs
// nothing to run.
//
// The one behaviour that matters more than the ranking itself: a
// retrieval floor. Below it, the Navigator says it has no source
// rather than answering from a weak match. See RETRIEVAL_FLOOR and
// retrieve.test.ts's off-corpus cases.
//
// Known, accepted limitation: there is no synonym expansion or
// stemming beyond a crude trailing-"s" strip. A query using different
// vocabulary from the corpus text loses, even when a person would
// obviously mean the same thing: "how long do I have" does not match
// a chunk headed "Limitation period" purely lexically. Confirmed while
// writing retrieve.test.ts, whose in-corpus test queries were phrased
// to share real vocabulary with the target chunk for exactly this
// reason, rather than quietly padding the scorer with a synonym table
// to make an unrealistic phrasing pass. A synonym layer is a real,
// scoped improvement for later, not a same-day fix.

import { ALL_CORPUS } from "@/lib/data/corpus";
import type { CorpusChunk } from "@/lib/types";

export const RETRIEVAL_FLOOR = 0.18;

export interface ScoredChunk {
  chunk: CorpusChunk;
  score: number;
}

const STOPWORDS = new Set([
  // English
  "a", "an", "the", "of", "in", "on", "to", "for", "and", "or", "is", "are",
  "was", "were", "be", "been", "being", "this", "that", "these", "those",
  "my", "me", "i", "it", "its", "with", "by", "as", "at", "from", "not",
  "do", "does", "did", "can", "will", "would", "should", "could", "has",
  "have", "had", "what", "which", "who", "whom", "how", "when", "where",
  "why", "any", "some", "no", "so", "if", "but", "about", "into", "than",
  // Hindi, transliterated and Devanagari, common function words
  "hai", "ka", "ki", "ke", "ko", "se", "aur", "yeh", "ye", "wo", "voh",
  "mera", "meri", "mere", "hoon", "hain", "kya", "kaise", "kyun", "kab",
  "है", "का", "की", "के", "को", "से", "और", "यह", "वह", "मेरा", "मेरी",
  "मेरे", "हूँ", "हैं", "क्या", "कैसे", "क्यों", "कब",
]);

/** Strips a trailing plural "s" (never "ss") from a word over three
 *  letters, so "court"/"courts", "right"/"rights", "deposit"/"deposits"
 *  match as the same term. Deliberately crude (no real stemmer, no
 *  irregular plurals): legal English leans heavily on this one pattern,
 *  and a crude rule that helps far more than it hurts beats pulling in
 *  a stemming library for it. */
function stem(word: string): string {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

function termFrequency(terms: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

interface IndexedChunk {
  chunk: CorpusChunk;
  bodyTerms: string[];
  headingTerms: Set<string>;
  bodyTf: Map<string, number>;
  rawLower: string;
}

function buildIndex(corpus: CorpusChunk[]): { indexed: IndexedChunk[]; df: Map<string, number> } {
  const indexed: IndexedChunk[] = corpus.map((chunk) => {
    const body = `${chunk.heading} ${chunk.act} ${chunk.text}`;
    const bodyTerms = normalize(body);
    return {
      chunk,
      bodyTerms,
      headingTerms: new Set(normalize(chunk.heading)),
      bodyTf: termFrequency(bodyTerms),
      rawLower: `${chunk.heading} ${chunk.text}`.toLowerCase(),
    };
  });

  const df = new Map<string, number>();
  for (const doc of indexed) {
    for (const term of new Set(doc.bodyTerms)) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  return { indexed, df };
}

/** Contiguous two- and three-word spans of the query, used to reward a
 *  chunk that contains the same phrase rather than the same words
 *  scattered apart, e.g. "security deposit" over two loose hits on
 *  "security" and "deposit" separately. */
function queryPhrases(queryTerms: string[]): string[] {
  const phrases: string[] = [];
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i + n <= queryTerms.length; i++) {
      phrases.push(queryTerms.slice(i, i + n).join(" "));
    }
  }
  return phrases;
}

export function retrieve(query: string, corpus: CorpusChunk[] = ALL_CORPUS): ScoredChunk[] {
  const queryTerms = normalize(query);
  if (queryTerms.length === 0 || corpus.length === 0) return [];

  const { indexed, df } = buildIndex(corpus);
  const N = indexed.length;
  const uniqueQueryTerms = new Set(queryTerms);
  const phrases = queryPhrases(queryTerms);
  // The strongest a single term's contribution can be: every query term
  // present in the corpus at minimum document frequency (idf maximal)
  // and boosted as a heading hit. Used only to scale scores into a
  // roughly 0-1 range; not query-dependent in the way that produced the
  // real bug this comment is here to warn against.
  const maxTermScore = Math.log(1 + N) * 3;

  const scored: ScoredChunk[] = indexed.map((doc) => {
    let raw = 0;
    for (const term of uniqueQueryTerms) {
      const tf = doc.bodyTf.get(term) ?? 0;
      if (tf === 0) continue;
      const documentFrequency = df.get(term) ?? 1;
      const idf = Math.log(1 + N / documentFrequency);
      const headingBoost = doc.headingTerms.has(term) ? 3 : 1;
      raw += Math.min(tf, 3) * idf * headingBoost;
    }
    let phraseHits = 0;
    for (const phrase of phrases) {
      if (doc.rawLower.includes(phrase)) phraseHits += 1;
    }
    // IMPORTANT: do not divide by this query's own max score across the
    // corpus. That normalization was tried first and is what silently
    // broke the confidence floor: a query with only one weak match in
    // the whole corpus would make that lone match everyone else's
    // yardstick, so it always came out as score 1.0 regardless of how
    // weak the match actually was, which is exactly backwards for a
    // floor meant to catch weak matches. Instead, normalize by how many
    // terms the query has (so a five-word and a one-word query land on
    // a comparable scale) against the fixed, query-independent
    // maxTermScore above, then add the phrase bonus on the same scale.
    const perTermAverage = uniqueQueryTerms.size > 0 ? raw / uniqueQueryTerms.size : 0;
    const score = perTermAverage / maxTermScore + phraseHits * 0.15;
    return { chunk: doc.chunk, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

/** True when the top result is confident enough to answer from. Below
 *  this, the Navigator declines rather than guessing (see answer.ts). */
export function isConfidentMatch(results: ScoredChunk[]): boolean {
  return results.length > 0 && results[0].score >= RETRIEVAL_FLOOR;
}
