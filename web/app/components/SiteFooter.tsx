import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-white/10 bg-[#0b1110]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-stone-100">
            <span className="inline-flex h-7 w-7 items-center justify-center border border-emerald-400/70 text-xs font-black text-emerald-300">AF</span>
            <span>AF<span className="text-emerald-400">_</span>LAB</span>
          </Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
            Independent AFL Fantasy analysis. Built for people who like looking beyond the score.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-stone-400">
          <Link className="transition hover:text-emerald-300" href="/policies">Policies</Link>
          <Link className="transition hover:text-emerald-300" href="/policies/data-sources">Data sources</Link>
          <Link className="transition hover:text-emerald-300" href="/policies/advertising">Advertising</Link>
          <Link className="transition hover:text-emerald-300" href="/policies/privacy">Privacy</Link>
          <Link className="transition hover:text-emerald-300" href="/imprint">Imprint</Link>
        </nav>
      </div>
      <div className="border-t border-white/[0.06] px-5 py-4 text-xs text-stone-600 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} AF_Lab. Independent project.</span>
          <span>Statistics are informational and may contain errors.</span>
        </div>
      </div>
    </footer>
  );
}
