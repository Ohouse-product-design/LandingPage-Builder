import { Hero } from "@/components/lead/Hero";
import { Form } from "@/components/lead/Form";
import { USP } from "@/components/lead/USP";
import { Process } from "@/components/lead/Process";
import { Review } from "@/components/lead/Review";
import { Contact } from "@/components/lead/Contact";
import { StickyButton } from "@/components/lead/StickyButton";

export default function LeadPage() {
  return (
    <main className="flex w-full flex-col bg-white pb-[82px] tablet:pb-[82px] desktop:pb-0">
      <Hero />
      <Form />
      <USP />
      <Process />
      <Review />
      <Contact />
      <div className="desktop:hidden">
        <StickyButton />
      </div>
    </main>
  );
}
