import { requireSession } from "@/lib/auth/session";
import { Interview } from "@/components/interview/Interview";

export const metadata = { title: "Start a filing | Adhikaar" };

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string }>;
}) {
  const { problem } = await searchParams;
  // Preserve ?problem= through the login detour, or a signed-out
  // visitor who asked the (public) Rights Navigator a question and
  // clicked "Get the record you will need" loses it at the sign-in
  // wall and has to retype what they already wrote once.
  const returnPath = problem ? `/start?problem=${encodeURIComponent(problem)}` : "/start";
  await requireSession(returnPath);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Interview initialProblem={problem} />
    </div>
  );
}
