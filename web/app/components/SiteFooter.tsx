import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-[#0d2b52]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center border border-[#f2b705] text-xs font-black text-[#f2b705]">AF</span>
            <span>AF<span className="text-[#f2b705]">_</span>LAB</span>
          </Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-blue-100/70">
            Independent AFL Fantasy analysis. Built for people who like looking beyond the score.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-blue-100/80">
          <Link className="transition hover:text-white" href="/policies">Policies</Link>
          <Link className="transition hover:text-white" href="/policies/data-sources">Data sources</Link>
          <Link className="transition hover:text-white" href="/policies/advertising">Advertising</Link>
          <Link className="transition hover:text-white" href="/policies/privacy">Privacy</Link>
          <Link className="transition hover:text-white" href="/imprint">Imprint</Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-xs text-blue-100/60 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} AF_Lab. Independent project.</span>
          <span>Statistics are informational and may contain errors.</span>
        </div>
      </div>
    </footer>
  );
}
