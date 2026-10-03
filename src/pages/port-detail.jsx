import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { useApi } from "../lib/hooks.js";
import { getApp, getRelease, getShots, getContributors } from "../lib/api.js";
import { Seo } from "../components/seo.jsx";
import { AppIcon } from "../components/app-icon.jsx";
import { ShotGallery } from "../components/shot-gallery.jsx";
import { Section } from "../components/section.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge, StatusBadge } from "../components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { Symbol } from "../components/symbol.jsx";
import { CopyButton } from "../components/copy-button.jsx";
import { patternFor, compatFor } from "../data/patterns.js";
import { formatBytes, formatDate } from "../lib/utils.js";
import NotFound from "./not-found.jsx";

const FORM_SYMBOL = { Phone: "phone", Tablet: "desktop", PC: "desktop", "2in1": "desktop", Foldable: "phone" };

export default function PortDetail() {
  // Route params come from context, so the id is available inside <Route path="/ports/:id">.
  const { id } = useParams();
  const app = useApi(getApp.bind(null, id), [id]);
  const release = useApi(getRelease.bind(null, id), [id]);
  const shots = useApi(getShots);
  const contributors = useApi(getContributors);

  const port = app.data;
  const pattern = port ? patternFor(port.id) : null;
  const compat = port ? compatFor(port.id) : null;
  const capture = port ? shots.data?.[port.id] : null;
  const builders = useMemo(
    () => (contributors.data ?? []).filter((c) => (port?.maintainers ?? []).includes(c.id)),
    [contributors.data, port]
  );

  if (app.error) return <NotFound />;

  if (!port) {
    return (
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 rounded-xl border border-line bg-surface-sunken" />
          <div className="h-64 rounded-xl border border-line bg-surface-sunken" />
          <div className="h-64 rounded-xl border border-line bg-surface-sunken" />
        </div>
      </Section>
    );
  }

  const forms = (compat?.form ?? "").split("·").map((f) => f.trim()).filter(Boolean);
  const latest = release.data;

  return (
    <>
      <Seo
        title={port.name}
        path={`/ports/${port.id}`}
        description={`${port.tagline}. ${port.description.slice(0, 130)}…`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: port.name,
          description: port.tagline,
          codeRepository: port.repo,
          programmingLanguage: port.stack,
          license: port.license,
          author: builders.map((b) => ({ "@type": "Person", name: b.name, url: b.github }))
        }}
      />

      {/* ---------- Header ---------- */}
      <section className="border-b border-line bg-surface-subtle">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/ports"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-brand"
          >
            <Symbol name="chevronRight" className="size-4 rotate-180" />
            All ports
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <AppIcon app={port} size="xl" className="shadow-h2" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{port.name}</h1>
                {compat ? (
                  <StatusBadge tone={compat.tone}>{compat.verification}</StatusBadge>
                ) : (
                  <StatusBadge tone={port.statusTone}>{port.status}</StatusBadge>
                )}
              </div>

              <p className="mt-2 text-lg text-foreground-muted">{port.tagline}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <Button asChild>
                  <a href={port.repo} target="_blank" rel="noreferrer">
                    <Symbol name="github" />
                    View repository
                  </a>
                </Button>
                {latest?.hasRelease && latest.assets?.[0] && (
                  <Button variant="outline" asChild>
                    <a href={latest.assets[0].downloadUrl} target="_blank" rel="noreferrer">
                      <Symbol name="download" />
                      {latest.tagName}
                    </a>
                  </Button>
                )}
                {pattern && (
                  <Button variant="ghost" asChild>
                    <Link href="/architecture">
                      <Symbol name={pattern.symbol} />
                      {pattern.title}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Facts strip */}
          <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Target">
              <span className="af-tnum">{port.api}</span>
            </Fact>
            <Fact label="Bundle">
              <code className="font-mono text-[13px]">{port.bundle}</code>
            </Fact>
            <Fact label="Licence">{port.license}</Fact>
            <Fact label="Form factors">
              <span className="flex flex-wrap items-center gap-2">
                {forms.map((form) => (
                  <span key={form} className="inline-flex items-center gap-1.5 text-[13px]">
                    <Symbol name={FORM_SYMBOL[form] ?? "phone"} className="size-3.5 text-foreground-faint" />
                    {form}
                  </span>
                ))}
              </span>
            </Fact>
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                Built with
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {port.stack.map((tech) => (
                  <Badge key={tech} tone="neutral" size="md">
                    {tech}
                  </Badge>
                ))}
              </dd>
            </div>
            {port.upstream && (
              <div className="sm:col-span-2 lg:col-span-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                  Ported from
                </dt>
                <dd className="mt-2">
                  <a
                    href={port.upstream}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] font-medium text-foreground hover:border-brand hover:text-brand"
                  >
                    <Symbol name="external" className="size-3.5" />
                    {port.upstream.replace("https://github.com/", "")}
                  </a>
                  {port.upstreamNote && (
                    <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-foreground-muted">
                      {port.upstreamNote}
                    </p>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* ---------- Tabs ---------- */}
      <Section>
        <Tabs defaultValue="overview">
          <TabsList aria-label="Port sections" className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="screenshots">Screenshots{capture?.count ? ` (${capture.count})` : ""}</TabsTrigger>
            <TabsTrigger value="porting">Porting</TabsTrigger>
            <TabsTrigger value="install">Install</TabsTrigger>
            <TabsTrigger value="release">Release</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <h2 className="text-lg font-semibold">What it is</h2>
              <p className="af-prose mt-4 text-[15px]">{port.description}</p>

              <h2 className="mt-10 text-lg font-semibold">What works</h2>
              <ul className="mt-4 space-y-3">
                {port.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-[15px] leading-relaxed text-foreground-muted">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                      <Symbol name="check" className="size-3" strokeWidth={2.4} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {port.disclaimer && (
                <Card className="mt-10 border-warn/40 bg-warn-soft/40">
                  <CardHeader className="flex-row items-start gap-3">
                    <Symbol name="alert" className="mt-0.5 size-5 shrink-0 text-warn" />
                    <div>
                      <CardTitle className="text-[15px]">Worth knowing before you install</CardTitle>
                      <CardContent className="p-0 text-[14px] leading-relaxed text-foreground-muted">
                        {port.disclaimer}
                      </CardContent>
                    </div>
                  </CardHeader>
                </Card>
              )}
            </div>

            <aside className="space-y-4">
              {compat && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[15px]">Verification record</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <Row label="Target" value={compat.target} mono />
                    <Row label="State" value={compat.verification} />
                    <Row label="Ran on" value={compat.checked} />
                    <Row label="Forms" value={compat.form} />
                  </CardContent>
                </Card>
              )}

              {builders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[15px]">Maintained by</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {builders.map((person) => (
                        <li key={person.id} className="flex items-center gap-3">
                          <img
                            src={person.avatar}
                            alt=""
                            width={36}
                            height={36}
                            loading="lazy"
                            className="size-9 shrink-0 rounded-full border border-line bg-surface-sunken"
                          />
                          <div className="min-w-0">
                            <a
                              href={person.github}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium hover:text-brand"
                            >
                              {person.name}
                            </a>
                            <p className="truncate text-xs text-foreground-muted">{person.role}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {port.category && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                      Category
                    </p>
                    <p className="mt-1.5 text-sm font-medium">{port.category}</p>
                    <Separator className="my-4" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                      Status line
                    </p>
                    <p className="mt-1.5 text-sm text-foreground-muted">{port.status}</p>
                  </CardContent>
                </Card>
              )}
            </aside>
          </TabsContent>

          {/* Screenshots */}
          <TabsContent value="screenshots">
            {capture?.groups?.length ? (
              <ShotGallery shots={capture} />
            ) : (
              <EmptyState
                symbol="film"
                title="No committed captures yet"
                body={`${port.name} has not published screenshots to its repository, so there is nothing honest to show here — a mockup would be worse than an empty grid.`}
              />
            )}
          </TabsContent>

          {/* Porting */}
          <TabsContent value="porting" className="space-y-8">
            {pattern && (
              <Card className="border-brand-line">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                      <Symbol name={pattern.symbol} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                        Porting pattern {pattern.badge} · {pattern.kind}
                      </p>
                      <CardTitle>{pattern.title}</CardTitle>
                    </div>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-foreground-muted">
                    {pattern.lead}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Call path */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                      Call path
                    </p>
                    <ol className="mt-3 flex flex-wrap items-center gap-2">
                      {pattern.flow.map((step, i) => (
                        <li key={step} className="flex items-center gap-2">
                          {i > 0 && (
                            <Symbol name="chevronRight" className="size-3.5 text-foreground-faint" />
                          )}
                          <code className="rounded-md bg-surface-sunken px-2.5 py-1.5 font-mono text-[12px] text-foreground">
                            {step}
                          </code>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Separator />

                  <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                        Why it works
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {pattern.desc.map((item) => (
                          <li key={item} className="text-sm leading-relaxed text-foreground-muted">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                        Trade-offs
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {pattern.points.map((item) => (
                          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-foreground-muted">
                            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-line-strong" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-lg font-semibold">Notes from the port</h2>
              <ul className="mt-4 space-y-3">
                {port.porting.map((note) => (
                  <li
                    key={note}
                    className="flex gap-3 rounded-lg border border-line bg-surface-subtle px-4 py-3.5 text-sm leading-relaxed text-foreground-muted"
                  >
                    <Symbol name="code" className="mt-0.5 size-4 shrink-0 text-brand" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Install */}
          <TabsContent value="install" className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <Card className="overflow-hidden">
              <CardHeader className="flex-row items-center gap-3 border-b border-line bg-surface-subtle">
                <Symbol name="terminal" className="size-4 text-foreground-muted" />
                <CardTitle className="font-mono text-[13px] font-medium">build &amp; install</CardTitle>
                <CopyButton text={port.install} className="ml-auto" label="" copied="" variant="subtle" />
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground-muted">
                  <code>{port.install}</code>
                </pre>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 text-sm text-foreground-muted">
                  <p className="font-medium text-foreground">Reading the target line</p>
                  <p className="mt-2 leading-relaxed">
                    <span className="font-mono text-[13px] text-brand">{port.api}</span> is the SDK and
                    device type this build targets. The bundle{" "}
                    <span className="font-mono text-[13px] text-foreground">{port.bundle}</span> is what{" "}
                    <span className="font-mono text-[13px]">hdc</span> installs and what the platform
                    identifies the app by — it cannot be changed after signing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 text-sm text-foreground-muted">
                  <p className="font-medium text-foreground">Licence and attribution</p>
                  <p className="mt-2 leading-relaxed">{port.license}.</p>
                  {port.upstream && (
                    <p className="mt-2 leading-relaxed">
                      The application itself belongs to{" "}
                      <a href={port.upstream} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                        {port.upstream.replace("https://github.com/", "")}
                      </a>
                      ; this repository is the HarmonyOS host, not a derivative design.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Release */}
          <TabsContent value="release">
            <ReleasePanel release={release} port={port} />
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

function ReleasePanel({ release, port }) {
  if (release.loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="h-4 w-1/3 rounded bg-surface-sunken" />
          <div className="h-3 w-2/3 rounded bg-surface-sunken" />
        </CardContent>
      </Card>
    );
  }

  const latest = release.data;

  if (!latest?.hasRelease) {
    return (
      <EmptyState
        symbol="download"
        title="No published release"
        body={`${port.name} builds from source — there is no GitHub release to download. The build commands in the Install tab are the whole story, and the repository carries the full instructions.`}
        action={
          <Button variant="outline" asChild>
            <a href={port.repo} target="_blank" rel="noreferrer">
              <Symbol name="github" />
              Open the repository
            </a>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
              Latest release
            </p>
            <CardTitle className="mt-1">{latest.name}</CardTitle>
          </div>
          {latest.publishedAt && (
            <span className="af-tnum ml-auto text-sm text-foreground-muted">
              {formatDate(latest.publishedAt)}
            </span>
          )}
          <Button variant="tonal" size="sm" asChild>
            <a href={latest.htmlUrl} target="_blank" rel="noreferrer">
              <Symbol name="external" />
              On GitHub
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-line">
            {latest.assets.map((asset) => (
              <li key={asset.name} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-sunken text-foreground-muted">
                  <Symbol name={asset.type === "hap" ? "download" : asset.type === "archive" ? "code" : "chevronRight"} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13px] font-medium">{asset.name}</p>
                  <p className="text-xs text-foreground-muted">{asset.label}</p>
                </div>
                <span className="af-tnum text-xs text-foreground-faint">
                  {asset.formattedSize}
                  {asset.downloadCount > 0 && ` · ${asset.downloadCount} downloads`}
                </span>
                {asset.installHint && (
                  <code className="hidden w-full rounded bg-surface-sunken px-2 py-1 font-mono text-[12px] text-foreground-muted sm:block">
                    {asset.installHint}
                  </code>
                )}
                <Button size="sm" variant="outline" asChild className="ml-auto">
                  <a href={asset.downloadUrl} target="_blank" rel="noreferrer">
                    Download
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {latest.body && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Release notes</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-foreground-muted">
              {latest.body}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Fact({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-foreground-faint">{label}</span>
      <span className={mono ? "af-tnum text-right text-[13px] text-foreground" : "text-right text-[13px] text-foreground"}>
        {value}
      </span>
    </div>
  );
}

export function EmptyState({ symbol, title, body, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong p-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-sunken text-foreground-faint">
        <Symbol name={symbol} className="size-5" />
      </span>
      <p className="mt-4 text-base font-medium">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-foreground-muted">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}