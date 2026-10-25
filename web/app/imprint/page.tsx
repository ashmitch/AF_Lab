import Link from "next/link";
import SiteFooter from "../components/SiteFooter";

export const metadata = {
  title: "Imprint | AF_Lab",
  description: "Operator and contact information for AF_Lab.",
};

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-[#101513] text-stone-100">
      <header className="border-b border-white/10 bg-[#0b100e]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-xl font-black tracking-[-0.06em]">AF<span className="text-emerald-400">_</span>LAB</Link>
          <Link href="/policies" className="text-sm text-stone-400 hover:text-emerald-300">Policies ↗</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400">AF_Lab / Legal information</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Imprint</h1>
        <p className="mt-4 text-sm leading-7 text-stone-400">Operator information for this website. Complete and verify the details below before publishing the site publicly.</p>
        <div className="mt-7 border-l-2 border-amber-300/70 bg-amber-200/[0.04] px-4 py-3 text-sm leading-6 text-stone-300">
          Important: this page is a template, not a determination of your legal obligations. The required information depends on who operates the site and the circumstances.
        </div>
        <section className="mt-8 space-y-6">
          <div className="border-b border-white/10 pb-5">
            <h2 className="font-bold">Website operator</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-400">[FULL LEGAL NAME OR LEGAL ENTITY NAME]{"\n"}[BUSINESS OR POSTAL ADDRESS AS LEGALLY REQUIRED]{"\n"}[POSTCODE, CITY, COUNTRY]</p>
          </div>
          <div className="border-b border-white/10 pb-5">
            <h2 className="font-bold">Contact</h2>
            <p className="mt-2 text-sm leading-7 text-stone-400">Email: [CONTACT EMAIL]{"\n"}Telephone: [IF REQUIRED]</p>
          </div>
          <div className="border-b border-white/10 pb-5">
            <h2 className="font-bold">Additional disclosures</h2>
            <p className="mt-2 text-sm leading-7 text-stone-400">Add any further information required for the actual operator and website, such as applicable register details, VAT identification number, supervisory authority or responsible person where legally relevant. Do not include a number or designation that you do not have.</p>
          </div>
          <div className="pb-5">
            <h2 className="font-bold">Editorial responsibility</h2>
            <p className="mt-2 text-sm leading-7 text-stone-400">[COMPLETE ONLY IF A RESPONSIBLE PERSON MUST BE NAMED UNDER APPLICABLE LAW]</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
