import { Link } from "wouter";
import { Seo } from "../components/seo.jsx";
import { Section } from "../components/section.jsx";
import { Button } from "../components/ui/button.jsx";
import { Symbol } from "../components/symbol.jsx";
import { NAV } from "../data/nav.js";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found"
        description="That page does not exist on AppFactory."
      />
      <Section>
        <div className="mx-auto max-w-lg py-16 text-center">
          <p className="af-tnum text-5xl font-semibold text-brand">404</p>
          <h1 className="mt-4 text-2xl font-semibold">No page at that address</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
            The link may be from an older version of the site, or the port may have been renamed. The
            catalogue is the safest place to pick the thread back up.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/ports">
                Browse the ports
                <Symbol name="arrowRight" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>

          <ul className="mt-12 flex flex-wrap justify-center gap-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[13px] font-medium text-foreground-muted hover:border-brand-line hover:text-brand"
                >
                  <Symbol name={item.symbol} className="size-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}