import { HeroAct } from "@/components/landing/HeroAct";
import { ContextAct } from "@/components/landing/ContextAct";
import { ProcessAct } from "@/components/landing/ProcessAct";
import { CoverageAct } from "@/components/landing/CoverageAct";
import { CloseAct } from "@/components/landing/CloseAct";

export default function HomePage() {
  return (
    <div>
      <HeroAct />
      <ContextAct />
      <ProcessAct />
      <CoverageAct />
      <CloseAct />
    </div>
  );
}
