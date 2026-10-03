import { useMemo } from "react";
import { Link } from "wouter";
import { useApi } from "../lib/hooks.js";
import { getApps, getContributors, getShots } from "../lib/api.js";
import { Seo } from "../components/seo.jsx";
import { Section, SectionHeader } from "../components/section.jsx";
import { PortCard, PortCardSkeleton } from "../components/port-card.jsx";
import { ShotWall } from "../components/shot-gallery.jsx";
import { AppIcon } from "../components/app-icon.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge, StatusBadge } from "../components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Symbol } from "../components/symbol.jsx";
import { CopyButton } from "../components/copy-button.jsx";
import { PATTERNS, COMPAT } from "../data/patterns.js";
import { SITE } from "../data/nav.js";

/** The port the hero leads with: newest seam, largest upstream. */
const FEATURED = "reel-edit";

export default function Home() {
  const apps = useApi(getApps);
  const contributors = useApi(getContributors);
  const shots = useApi(getShots);

  const list = useMemo(() => apps.data ?? [], [apps.data]);
  const featured = list.find((a) => a.id === FEATURED) ?? list[0] ?? null;
  const heroShot = featured ? shots.data?.[featured.id]?.groups?.[0]?.shots?.[0] : null;

  const captureCount = useMemo(
    () => Object.values(shots.data ?? {}).reduce((n, entry) => n + (entry.count ?? 0), 0),
    [shots.data]
  );

  const stats = [
    { value: list.length || "—", label: "ports shipped" },
    { value: PATTERNS.length, label: "porting seams" },
    { value: captureCount || "—", label: "real captures" },
    { value: contributors.data?.length ?? "—", label: "builders" }
  ];

  const jsonLd = list.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Apps ported to HarmonyOS and OpenHarmony",
        itemListElement: list.map((app, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: app.name,
          description: app.tagline,
          url: `${SITE.url}/ports/${app.id}`
        }))
      }
    : null;

  return (
    <>
      <Seo
        description="Six global apps ported to OpenHarmony and HarmonyOS — a video editor, an X client, Google Maps, GNU Emacs and WhatsApp. Each records its porting seam, its trade-offs and what is actually verified."
        jsonLd={jsonLd}
      />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="af-grid absolute inset-0 text-foreground opacity-70" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-line to-transparent"
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-soft-foreground">
                <Symbol name="sparkle" className="size-3.5" />
                OpenHarmony · HarmonyOS 6.1.1
              </p>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Global apps, ported to
                <span className="text-brand"> HarmonyOS</span> — and written down
                honestly.
              </h1>

              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-foreground-muted">
                Six ports, six different seams: a native ArkTS client, a web shell with the chrome
                rebuilt around it, a 5,200-star video editor hosted unmodified in ArkWeb, a Flutter
                shim, an NAPI bridge into C, and a companion Go server. Every one records what was
                verified on a device — and what was not.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/ports">
                    Browse the ports
                    <Symbol name="arrowRight" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/architecture">Read the seams</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <a href={SITE.repo} target="_blank" rel="noreferrer">
                    <Symbol name="github" />
                    Source
                  </a>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="af-tnum block text-2xl font-semibold text-foreground">
                        {stat.value}
                      </span>
                      <span className="mt-0.5 block text-xs text-foreground-faint">{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Featured port, with a real capture from its repository */}
            {featured && (
              <div className="lg:pl-6">
                <Link
                  href={`/ports/${featured.id}`}
                  className="group block rounded-2xl border border-line bg-surface p-6 no-underline shadow-h2 hover:border-brand-line hover:shadow-h3"
                >
                  <div className="flex items-center gap-3">
                    <AppIcon app={featured} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                        Latest port
                      </p>
                      <h2 className="truncate text-lg font-semibold">{featured.name}</h2>
                    </div>
                    <Symbol
                      name="arrowRight"
                      className="size-5 shrink-0 text-foreground-faint group-hover:text-brand"
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                    {featured.tagline}
                  </p>

                  {heroShot && (
                    <div className="mt-5 overflow-hidden rounded-xl border border-line bg-surface-sunken">
                      <img
                        src={heroShot.src}
                        alt={`${heroShot.label} — ${featured.name} on ${featured.api}`}
                        width={heroShot.width}
                        height={heroShot.height}
                        className="w-full object-cover"
                        style={{ aspectRatio: `${heroShot.width} / ${heroShot.height}` }}
                      />
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={featured.statusTone}>{featured.status}</StatusBadge>
                    <Badge tone="outline">{featured.api}</Badge>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Ports ---------- */}
      <Section id="ports" alt>
        <SectionHeader eyebrow="The catalogue" title="Six ports, six seams" id="portsHeading">
          Each one is a working repository with its own licence and its own honest status line.
        </SectionHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.loading && Array.from({ length: 6 }, (_, i) => <PortCardSkeleton key={i} />)}
          {list.map((app) => (
            <PortCard
              key={app.id}
              app={app}
              compat={COMPAT.find((c) => c.id === app.id)}
            />
          ))}
        </div>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/ports">
              Full catalogue with filters
              <Symbol name="arrowRight" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* ---------- Patterns ---------- */}
      <Section id="patterns" inverse>
        <SectionHeader eyebrow="Porting patterns" title="The seam is the lesson" id="patternsHeading" inverse>
          Six ports, six answers to “what do you do when the upstream does not run here?”. Each seam
          has a cost; the point of writing them down is the cost.
        </SectionHeader>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS.map((pattern) => (
            <li key={pattern.id}>
              <Link
                href={`/ports/${pattern.id}`}
                className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.04] p-5 no-underline hover:border-white/25 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-white/10 text-brand">
                    <Symbol name={pattern.symbol} className="size-4.5" />
                  </span>
                  <span className="af-tnum text-xs font-semibold tracking-[0.14em] text-foreground-inverse-muted">
                    {pattern.badge}
                  </span>
                  <Badge tone="neutral" className="ml-auto bg-white/10 text-foreground-inverse-muted">
                    {pattern.kind}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground-inverse">
                  {pattern.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-inverse-muted">
                  {pattern.lead}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Compatibility ---------- */}
      <Section id="compatibility">
        <SectionHeader
          eyebrow="Compatibility record"
          title="What is actually verified"
          id="compatHeading"
        >
          A target API is a claim. This table is what a person actually ran, on what, and how far it
          got. Rows marked <span className="whitespace-nowrap">Stage&nbsp;1</span> or{" "}
          <span className="whitespace-nowrap">Beta</span> are unfinished and say so.
        </SectionHeader>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-surface-subtle text-xs uppercase tracking-wide text-foreground-faint">
                <th scope="col" className="px-5 py-3.5 font-semibold">Port</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Target</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">State</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Verified</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Form factors</th>
              </tr>
            </thead>
            <tbody>
              {COMPAT.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <th scope="row" className="px-5 py-4 font-medium">
                    <Link href={`/ports/${row.id}`} className="hover:text-brand">
                      {row.id === "reel-edit" ? "Reel-Edit" : row.id}
                    </Link>
                  </th>
                  <td className="af-tnum px-5 py-4 text-foreground-muted">{row.target}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={row.tone}>{row.verification}</StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-foreground-muted">{row.checked}</td>
                  <td className="px-5 py-4 text-foreground-muted">{row.form}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------- Captures ---------- */}
      {shots.loading || captureCount > 0 ? (
        <Section id="captures" alt>
          <SectionHeader eyebrow="Screenshots" title="Every capture comes from the repository" id="capturesHeading">
            No mockups. These are the files each port committed, pulled straight from GitHub and
            labelled with the device they were taken on.
          </SectionHeader>
          <ShotWall shots={shots.data} limit={6} />
          <p className="mt-6 text-sm text-foreground-muted">
            {shots.loading ? "Loading captures…" : `${captureCount} captures across the catalogue.`}{" "}
            <Link href="/ports/opentwit-web" className="text-brand hover:underline">
              See the full viewer
            </Link>
          </p>
        </Section>
      ) : null}

      {/* ---------- Builders ---------- */}
      <Section id="builders">
        <SectionHeader eyebrow="Builders" title="Who does the porting" id="buildersHeading">
          Porting is maintenance forever, not a weekend. These are the people carrying it.
        </SectionHeader>

        <ul className="grid gap-4 sm:grid-cols-2">
          {(contributors.data ?? []).map((person) => (
            <li key={person.id}>
              <Card className="h-full">
                <CardHeader className="flex-row items-center gap-4">
                  <img
                    src={person.avatar}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="size-12 shrink-0 rounded-full border border-line bg-surface-sunken"
                  />
                  <div className="min-w-0">
                    <CardTitle>{person.name}</CardTitle>
                    <p className="text-[13px] text-foreground-muted">{person.role}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {person.focus.map((item) => (
                      <Badge key={item} tone="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Developers ---------- */}
      <Section id="developers" alt>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeader eyebrow="For developers" title="Run the site" id="devHeading">
              One command and a port. The whole site is a React SPA in front of a small JSON API —
              every port, capture and release is plain JSON you can read.
            </SectionHeader>
            <ul className="mt-6 space-y-3 text-sm text-foreground-muted">
              <li className="flex gap-3">
                <Symbol name="check" className="mt-0.5 size-4 shrink-0 text-ok" />
                <span>
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                    npm start
                  </code>{" "}
                  serves the built site and the API together.
                </span>
              </li>
              <li className="flex gap-3">
                <Symbol name="check" className="mt-0.5 size-4 shrink-0 text-ok" />
                <span>
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                    npm run dev
                  </code>{" "}
                  runs Vite on :5173 with{" "}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                    /api
                  </code>{" "}
                  proxied to Express.
                </span>
              </li>
              <li className="flex gap-3">
                <Symbol name="check" className="mt-0.5 size-4 shrink-0 text-ok" />
                <span>Adding a port is one object in{" "}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                    data/apps.json
                  </code>
                  .
                </span>
              </li>
            </ul>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center gap-3 border-b border-line bg-surface-subtle">
              <Symbol name="terminal" className="size-4 text-foreground-muted" />
              <CardTitle className="font-mono text-[13px] font-medium">quickstart</CardTitle>
              <CopyButton
                text={SITE.quickstart}
                className="ml-auto"
                variant="subtle"
                label=""
                copied=""
              />
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground-muted">
                <code>
                  <span className="text-foreground-faint">$ </span>
                  git clone https://github.com/Abhi-Flex1/AppFactory.git
                  {"\n"}
                  <span className="text-foreground-faint">$ </span>
                  cd AppFactory && npm install
                  {"\n"}
                  <span className="text-foreground-faint">$ </span>
                  npm start
                  {"\n\n"}
                  <span className="text-ok">AppFactory listening on http://localhost:3000</span>
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}