import { Link } from "wouter";
import { Seo } from "../components/seo.jsx";
import { Section, SectionHeader } from "../components/section.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { StatusBadge } from "../components/ui/badge.jsx";
import { Symbol } from "../components/symbol.jsx";
import { AppIcon } from "../components/app-icon.jsx";
import { PATTERNS, COMPAT } from "../data/patterns.js";
import { useApi } from "../lib/hooks.js";
import { getApps } from "../lib/api.js";

export default function Architecture() {
  const apps = useApi(getApps);
  const byId = Object.fromEntries((apps.data ?? []).map((a) => [a.id, a]));

  return (
    <>
      <Seo
        title="Porting patterns"
        path="/architecture"
        description="The six seams AppFactory has used to move global apps onto HarmonyOS — a native ArkTS client, a native web shell, an upstream web host, a Flutter shim, an NAPI bridge and a companion server."
      />

      <Section>
        <SectionHeader
          eyebrow="Architecture"
          title="Six seams, and what each one costs"
          id="archHeading"
          level={1}
        >
          Porting is not one problem. The upstream might be a Dart plugin, a C codebase, a web app
          you do not control, or a protocol that will not fit in a phone. Each port below picked a
          seam and then paid for it — this page is the bill.
        </SectionHeader>

        <ol className="space-y-4">
          {PATTERNS.map((pattern) => {
            const app = byId[pattern.id];
            const compat = COMPAT.find((c) => c.id === pattern.id);
            return (
              <li key={pattern.id}>
                <Card className="overflow-hidden">
                  <div className="grid gap-8 p-6 lg:grid-cols-[1fr_1.05fr] lg:p-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="af-tnum grid size-9 place-items-center rounded-full bg-surface-sunken text-sm font-semibold text-foreground-muted">
                          {pattern.badge}
                        </span>
                        <h2 className="text-xl font-semibold">{pattern.title}</h2>
                        <Badge tone="brand" size="md">
                          {pattern.kind}
                        </Badge>
                        {app && (
                          <Link href={`/ports/${pattern.id}`} className="ml-auto">
                            <Badge tone="outline" size="md">
                              {app.name}
                              <Symbol name="arrowRight" />
                            </Badge>
                          </Link>
                        )}
                      </div>

                      <p className="mt-4 text-[15px] font-medium leading-relaxed text-foreground">
                        {pattern.lead}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {app && <AppIcon app={app} size="sm" />}
                        {compat && <StatusBadge tone={compat.tone}>{compat.verification}</StatusBadge>}
                        {compat && (
                          <span className="af-tnum text-xs text-foreground-faint">{compat.target}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                          Call path
                        </p>
                        <ol className="mt-3 flex flex-wrap items-center gap-1.5">
                          {pattern.flow.map((step, i) => (
                            <li key={step} className="flex items-center gap-1.5">
                              {i > 0 && (
                                <Symbol name="chevronRight" className="size-3 text-foreground-faint" />
                              )}
                              <code className="rounded bg-surface-sunken px-2 py-1 font-mono text-[12px] text-foreground">
                                {step}
                              </code>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                          Trade-offs
                        </p>
                        <ul className="mt-3 space-y-2">
                          {pattern.points.map((point) => (
                            <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-foreground-muted">
                              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-line-strong" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {app && (
                    <CardContent className="border-t border-line bg-surface-subtle p-5 lg:px-8">
                      <p className="text-sm leading-relaxed text-foreground-muted">{app.description}</p>
                      <Button variant="link" className="mt-2" asChild>
                        <Link href={`/ports/${pattern.id}`}>
                          Read {app.name}’s porting notes
                          <Symbol name="arrowRight" />
                        </Link>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section alt>
        <SectionHeader eyebrow="Choosing" title="Which seam would you use?" id="chooseHeading">
          A rough decision rule, taken from the six ports above.
        </SectionHeader>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-surface text-xs uppercase tracking-wide text-foreground-faint">
                <th scope="col" className="px-5 py-3.5 font-semibold">If the upstream is…</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Use</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Because</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["A documented API, no GMS", "Native ArkTS app", "Nothing to bridge; the SDK is enough"],
                ["A web app you cannot replace", "Native web shell", "You get the features on day one"],
                ["A whole app, MIT, that runs in a browser", "Upstream web host", "Host it, then supply the platform layer"],
                ["A Flutter plugin", "Backport shim", "Keep the Dart API, implement the platform interface"],
                ["A C or C++ engine", "ArkTS shell + NAPI", "Cross-compile beats rewrite, every time"],
                ["A protocol too heavy for a phone", "Companion server", "Keep crypto and sessions in a daemon"]
              ].map(([upstream, use, because]) => (
                <tr key={use} className="border-t border-line">
                  <th scope="row" className="px-5 py-4 font-medium">{upstream}</th>
                  <td className="px-5 py-4 text-brand">{use}</td>
                  <td className="px-5 py-4 text-foreground-muted">{because}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}