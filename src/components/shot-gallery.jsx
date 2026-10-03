import { useMemo, useState } from "react";
import { cn } from "../lib/cn.js";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { Dialog, DialogGrip, DialogTitle } from "./ui/dialog.jsx";
import { Symbol } from "./symbol.jsx";

/** Flatten the manifest once: [{ group, shot }, …] is the gallery's real order. */
function flatten(groups) {
  return groups.flatMap((group) => group.shots.map((shot) => ({ group, shot })));
}

/**
 * Screenshots, all of which are real captures committed to each port repository.
 * A device tab per form factor, a thumbnail strip, and a lightbox on the full
 * image — with the capture method stated under the group, not buried.
 */
export function ShotGallery({ shots }) {
  const groups = useMemo(() => (shots?.groups ?? []).filter((g) => g.shots.length), [shots]);
  const [open, setOpen] = useState(-1); // index into the flattened gallery

  if (!groups.length) return null;
  const all = flatten(groups);

  return (
    <>
      <Tabs defaultValue={groups[0].id} className="w-full">
        {groups.length > 1 && (
          <TabsList aria-label="Device form factor" className="mb-6 w-auto">
            {groups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.title}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        {groups.map((group) => {
          const groupStart = all.findIndex((e) => e.group.id === group.id);
          const [hero] = group.shots;

          return (
            <TabsContent key={group.id} value={group.id}>
              <div className="grid gap-6 lg:grid-cols-[1fr_15rem] lg:items-start">
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(groupStart)}
                    aria-label={`Enlarge ${hero.label}`}
                    className={cn(
                      "group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-line bg-surface-sunken",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    )}
                  >
                    <img
                      src={hero.src}
                      alt={`${hero.label} — captured on ${group.device}`}
                      width={hero.width}
                      height={hero.height}
                      loading="lazy"
                      decoding="async"
                      className="mx-auto block max-h-[34rem] w-auto object-contain"
                    />
                    <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100">
                      <Symbol name="search" className="size-4" />
                    </span>
                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                    <Badge tone="neutral">{group.title}</Badge>
                    <span className="af-tnum">{group.device}</span>
                    {group.capture && <span className="text-foreground-faint">· {group.capture}</span>}
                  </div>
                </div>

                <ul className="af-scroll-x flex gap-2 lg:flex-col lg:overflow-visible">
                  {group.shots.map((shot, i) => (
                    <li key={shot.id} className="shrink-0 lg:w-full">
                      <button
                        type="button"
                        onClick={() => setOpen(groupStart + i)}
                        title={`${shot.label} — open full size`}
                        className="block w-full overflow-hidden rounded-lg border border-line hover:border-brand-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <img
                          src={shot.thumb}
                          alt={shot.label}
                          width={group.frame === "wide" ? 300 : 150}
                          height={group.frame === "wide" ? 200 : 240}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[3/2] w-full object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Lightbox all={all} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />
    </>
  );
}

/** Full-size viewer with previous / next across the whole gallery. */
function Lightbox({ all, index, onIndex, onClose }) {
  const current = index >= 0 ? all[index] : null;

  return (
    <Dialog
        open={Boolean(current)}
        onOpenChange={(open) => !open && onClose()}
        label="Screenshot viewer"
      >
      {current && (
        <div className="sm:w-[min(64rem,94vw)] sm:self-center">
          <DialogGrip />
          <div className="p-4 sm:p-6">
            <DialogTitle className="mb-4 flex items-center gap-3">
              <span>{current.shot.label}</span>
              <span className="af-tnum text-sm font-normal text-foreground-muted">
                {index + 1} / {all.length}
              </span>
            </DialogTitle>

            <img
              src={current.shot.src}
              alt={`${current.shot.label} — captured on ${current.group.device}`}
              width={current.shot.width}
              height={current.shot.height}
              className="mx-auto max-h-[60vh] w-auto rounded-lg border border-line object-contain"
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-foreground-muted">
                {current.group.capture} · {current.group.device}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => onIndex(index - 1)}
                >
                  <Symbol name="chevronRight" className="rotate-180" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === all.length - 1}
                  onClick={() => onIndex(index + 1)}
                >
                  Next
                  <Symbol name="chevronRight" />
                </Button>
                <Button variant="tonal" size="sm" asChild>
                  <a href={current.shot.source} target="_blank" rel="noreferrer">
                    <Symbol name="github" />
                    Source
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/** Static wall of thumbnails, used on the home page. */
export function ShotWall({ shots, limit = 6 }) {
  const all = useMemo(() => flatten((shots?.groups ?? []).filter((g) => g.shots.length)), [shots]);
  if (!all.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {all.slice(0, limit).map(({ shot }) => (
        <li key={shot.id}>
          <a
            href={shot.source}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg border border-line hover:border-brand-line"
          >
            <img
              src={shot.thumb}
              alt={shot.label}
              width={300}
              height={200}
              loading="lazy"
              decoding="async"
              className="aspect-[3/2] w-full object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}