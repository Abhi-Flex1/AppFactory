#!/usr/bin/env python3
"""Pull the app screenshots that live in the port repositories on GitHub and
build the web assets the site serves.

Usage
-----
    python3 scripts/fetch-shots.py            # download and optimise everything
    python3 scripts/fetch-shots.py --refresh  # ignore the cache and re-download
    python3 scripts/fetch-shots.py opentwit-web

Sources live in ``scripts/shots.sources.json`` (curated: file, slug, label,
device, capture). Output:

    public/shots/<app>/<slug>.jpg          viewer-sized image
    public/shots/<app>/thumbs/<slug>.jpg   thumbnail for the strip
    data/shots.json                        manifest consumed by /api/shots

Requires Pillow (``pip install pillow``).
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
import urllib.request
from io import BytesIO

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ROOT / "scripts" / "shots.sources.json"
MANIFEST = ROOT / "data" / "shots.json"
CACHE = ROOT / "scripts" / ".shots-cache"
PUBLIC = ROOT / "public"

# frame kind -> (viewer width, thumbnail width, jpeg quality, max upscale width)
FRAMES = {
    "phone": (620, 150, 82, 700),
    "wide": (900, 300, 84, 1300),
}


def download(repo: str, ref: str, path: str, refresh: bool) -> bytes:
    cache_file = CACHE / repo.replace("/", "__") / path.replace("/", "__")
    if cache_file.exists() and not refresh:
        return cache_file.read_bytes()
    url = f"https://raw.githubusercontent.com/{repo}/{ref}/{path}"
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read()
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_bytes(data)
    return data


def at_width(image: Image.Image, width: int, ceiling: int) -> Image.Image:
    width = min(width, ceiling, image.width)
    if image.width == width:
        return image
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


def write_jpeg(image: Image.Image, width: int, ceiling: int, quality: int, target: pathlib.Path) -> tuple[int, int]:
    frame = at_width(image.convert("RGB"), width, ceiling)
    target.parent.mkdir(parents=True, exist_ok=True)
    frame.save(target, "JPEG", quality=quality, optimize=True, progressive=True)
    return frame.size


def build(app_id: str, config: dict, refresh: bool) -> dict:
    repo = config["repo"]
    ref = config.get("ref", "main")
    groups = []
    for group in config.get("groups", []):
        frame_kind = group.get("frame", "phone")
        view_w, thumb_w, quality, ceiling = FRAMES[frame_kind]
        shots = []
        for shot in group["shots"]:
            raw = download(repo, ref, shot["file"], refresh)
            with Image.open(BytesIO(raw)) as image:
                view_rel = pathlib.Path("shots") / app_id / (shot["slug"] + ".jpg")
                thumb_rel = pathlib.Path("shots") / app_id / "thumbs" / (shot["slug"] + ".jpg")
                width, height = write_jpeg(image, view_w, ceiling, quality, PUBLIC / view_rel)
                write_jpeg(image, thumb_w, ceiling, 78, PUBLIC / thumb_rel)
            shots.append(
                {
                    "id": shot["slug"],
                    "label": shot["label"],
                    "src": "/" + view_rel.as_posix(),
                    "thumb": "/" + thumb_rel.as_posix(),
                    "width": width,
                    "height": height,
                    "source": f"https://github.com/{repo}/blob/{ref}/{shot['file']}",
                    "raw": f"https://raw.githubusercontent.com/{repo}/{ref}/{shot['file']}",
                }
            )
            print(f"  - {app_id}/{shot['slug']}  {width}x{height}")
        if shots:
            groups.append(
                {
                    "id": group["id"],
                    "title": group["title"],
                    "device": group.get("device", ""),
                    "capture": group.get("capture", ""),
                    "frame": frame_kind,
                    "shots": shots,
                }
            )
    return {
        "repo": repo,
        "ref": ref,
        "groups": groups,
        "count": sum(len(group["shots"]) for group in groups),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("apps", nargs="*", help="limit to these app ids")
    parser.add_argument("--refresh", action="store_true", help="re-download everything")
    args = parser.parse_args()

    sources = json.loads(SOURCES.read_text())
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    for app_id, config in sources.items():
        if args.apps and app_id not in args.apps:
            continue
        if not config.get("groups"):
            manifest[app_id] = {"repo": config["repo"], "ref": config.get("ref", "main"), "groups": [], "count": 0}
            print(f"{app_id} - no captures committed in {config['repo']} yet")
            continue
        print(f"{app_id} from {config['repo']}")
        manifest[app_id] = build(app_id, config, args.refresh)

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    total = sum(entry["count"] for entry in manifest.values())
    print(f"\n{total} screenshots across {len(manifest)} ports -> public/shots/, manifest at data/shots.json")


if __name__ == "__main__":
    main()
