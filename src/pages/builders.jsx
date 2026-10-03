import { Link } from "wouter";
import { useApi } from "../lib/hooks.js";
import { getApps, getContributors } from "../lib/api.js";
import { Seo } from "../components/seo.jsx";
import { Section, SectionHeader } from "../components/section.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Symbol } from "../components/symbol.jsx";
import { AppIcon } from "../components/app-icon.jsx";

export default function Builders() {
  const people = useApi(getContributors);
  const apps = useApi(getApps);
  const byId = Object.fromEntries((apps.data ?? []).map((a) => [a.id, a]));

  return (
    <>
      <Seo
        title="Builders"
        path="/builders"
        description="The people porting global apps to OpenHarmony and HarmonyOS — who maintains which port, and where to follow the work."
      />

      <Section>
        <SectionHeader
          eyebrow="Builders"
          title="Porting is maintenance"
          id="buildersHeading"
          level={1}
        >
          A port is not a weekend. Each one needs a device to test on, a platform to track, and
          somebody who cares when an upstream API moves. These are they.
        </SectionHeader>

        <div className="space-y-6">
          {(people.data ?? []).map((person) => {
            const owned = (person.focus ?? [])
              .map((item) => byId[item])
              .filter(Boolean);

            return (
              <Card key={person.id}>
                <CardHeader className="flex-row flex-wrap items-center gap-5">
                  <img
                    src={person.avatar}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="size-16 shrink-0 rounded-full border border-line bg-surface-sunken"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle as="h2" className="text-xl">
                      {person.name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-foreground-muted">{person.role}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={person.github} target="_blank" rel="noreferrer">
                          <Symbol name="github" />
                          GitHub
                        </a>
                      </Button>
                      {person.twitter && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={person.twitter} target="_blank" rel="noreferrer">
                            <Symbol name="external" />
                            {person.twitterHandle}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                    {owned.length ? "Looking after" : "Focus"}
                  </p>

                  {owned.length > 0 ? (
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {owned.map((app) => (
                        <li key={app.id}>
                          <Link
                            href={`/ports/${app.id}`}
                            className="flex h-full items-start gap-3 rounded-lg border border-line p-3.5 no-underline hover:border-brand-line hover:bg-surface-subtle"
                          >
                            <AppIcon app={app} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{app.name}</p>
                              <p className="mt-0.5 text-xs leading-snug text-foreground-muted">
                                {app.tagline}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {app.stack.slice(0, 3).map((tech) => (
                                  <Badge key={tech} tone="neutral">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {person.focus.map((item) => (
                        <Badge key={item} tone="neutral" size="md">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {people.loading &&
            Array.from({ length: 2 }, (_, i) => (
              <Card key={i}>
                <CardHeader className="flex-row items-center gap-5">
                  <div className="size-16 rounded-full bg-surface-sunken" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 rounded bg-surface-sunken" />
                    <div className="h-3 w-64 rounded bg-surface-sunken" />
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>

        <Card className="mt-8 border-brand-line bg-brand-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-brand-soft-foreground">Port something yourself?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">
              Add one object to <code className="font-mono">data/apps.json</code>, list the repository in{" "}
              <code className="font-mono">REPO_MAP</code> if it publishes releases, and open a pull
              request. The catalogue, the compatibility record, the pattern pages and the footer all
              read from that one file — nothing else needs touching.
            </p>
            <Button className="mt-4" asChild>
              <a href="https://github.com/Abhi-Flex1/AppFactory" target="_blank" rel="noreferrer">
                <Symbol name="github" />
                Open a pull request
              </a>
            </Button>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}