import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import { policies } from "./policyContent";

const visiblePolicies = [
  { slug: "privacy", number: "01", title: "Privacy policy", description: "Personal data, service providers, rights and contact details." },
  { slug: "cookies", number: "02", title: "Cookie policy", description: "Cookies, advertising technologies and consent choices." },
  { slug: "advertising", number: "03", title: "Advertising policy", description: "How ads support free access and how placements are labelled." },
  { slug: "terms", number: "04", title: "Terms of use", description: "Website use, accuracy, availability and third-party rights." },
  { slug: "data-sources", number: "05", title: "Data sources & methodology", description: "Source attribution, calculations and limitations of the statistics." },
  { slug: "adsense-setup", number: "06", title: "AdSense launch checklist", description: "Practical implementation steps for the planned ad integration." },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
      <header className="border-b border-white/10 bg-[#0d2b52] text-white shadow-lg shadow-slate-900/10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
          <Link href="/" className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            AF<span className="text-[#f2b705]">_</span>LAB
            <span className="ml-3 hidden text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/70 sm:inline">AFL Fantasy Intelligence</span>
          </Link>
          <Link href="/" className="rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-blue-50 transition hover:border-[#f2b705] hover:text-[#f2b705]">← Back to statistics</Link>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#d4202c] via-[#f2b705] to-[#f2b705]" />
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b18200]">AF_Lab / Transparency</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0d2b52] sm:text-6xl">Policies & information</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">How the site works, how information is handled and what to know about the statistics and advertising.</p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            These pages are initial drafts. Replace all placeholders and confirm that every statement matches the live site before public launch.
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePolicies.map((item) => (
            <Link key={item.slug} href={`/policies/${item.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2b52] text-xs font-bold text-[#f2b705]">{item.number}</span>
                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#b18200]">↗</span>
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
              <p className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">Updated {policies[item.slug].updated}</p>
            </Link>
          ))}
          <Link href="/imprint" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2b52] text-xs font-bold text-[#f2b705]">07</span><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#b18200]">↗</span></div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">Imprint / Legal notice</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Operator identity, contact information and applicable disclosures.</p>
            <p className="mt-5 border-t border-slate-100 pt-3 text-xs font-semibold text-amber-700">Requires operator details</p>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
