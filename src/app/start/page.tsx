import { requireSession } from "@/lib/auth/session";
import { Interview } from "@/components/interview/Interview";

export const metadata = { title: "Start a filing | Adhikaar" };

export default async function StartPage() {
  await requireSession("/start");

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Interview />
    </div>
  );
}
