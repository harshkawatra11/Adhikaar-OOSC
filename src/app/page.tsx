import { HeroAct } from "@/components/landing/HeroAct";
import { EvidenceAct } from "@/components/landing/EvidenceAct";
import { ContextAct } from "@/components/landing/ContextAct";
import { ProcessAct } from "@/components/landing/ProcessAct";
import { CoverageAct } from "@/components/landing/CoverageAct";
import { CloseAct } from "@/components/landing/CloseAct";

export default function HomePage() {
  return (
    <div>
      <HeroAct />
      <EvidenceAct />
      <ContextAct />
      <ProcessAct />
      <CoverageAct />
      <CloseAct />
    </div>
  );
}
