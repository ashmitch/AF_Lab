import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import { policies } from "./policyContent";

export default function PolicyArticle({ slug }: { slug: string }) {
  const policy = policies[slug];

  if (!policy) {
    return (
      <main className="min-h-screen bg-[#f4f6fa] px-5 py-16 text-slate-900">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <Link href="/policies" className="mt-4 inline-block text-[#f2b705] hover:underline">Back to policies</Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
      <header className="border-b border-slate-200 bg-[#0d2b52]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-7 lg:px-10">
          <Link href="/" className="text-xl font-black tracking-[-0.06em]">AF<span className="text-[#f2b705]">_</span>LAB</Link>
          <Link href="/policies" className="text-sm text-slate-500 hover:text-[#f2b705]">All policies ↗</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/policies" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2b705] hover:text-[#f2b705]">← Policies</Link>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b18200]">AF_Lab / Legal & transparency</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{policy.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-500">{policy.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-slate-200 py-3 text-xs text-slate-500">
          <span>Last reviewed: {policy.updated}</span>
          {policy.draft && <span className="border border-amber-300/30 px-2 py-1 text-amber-200">Draft — review before launch</span>}
        </div>
        {policy.draft && (
          <div className="mt-6 border-l-2 border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700">
            This is starter text, not legal advice. Replace placeholders and verify every statement against the live website, providers and applicable requirements before publishing.
          </div>
        )}
        <article className="mt-8 space-y-8">
          {policy.sections.map((section) => (
            <section key={section.heading} className="border-b border-slate-200 pb-7 last:border-0">
              <h2 className="text-lg font-bold tracking-tight">{section.heading}</h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p key={index} className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-500">{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-500">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>
        <div className="mt-8 border border-slate-200 p-4">
          <p className="text-sm font-semibold">Related pages</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#f2b705]">
            <Link href="/policies/privacy" className="hover:underline">Privacy</Link>
            <Link href="/policies/cookies" className="hover:underline">Cookies</Link>
            <Link href="/policies/advertising" className="hover:underline">Advertising</Link>
            <Link href="/policies/data-sources" className="hover:underline">Data sources</Link>
            <Link href="/imprint" className="hover:underline">Imprint</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
