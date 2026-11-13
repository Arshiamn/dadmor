#!/usr/bin/env python3
"""v4 data fixes (owner orders, 2026-11-05 evening):
1. Strip ZWNJ (U+200C, nim-fasele) from EVERY Persian string in src/data
   JSON and in src TS/TSX sources (owner: no half-spaces anywhere in any
   text, title or heading). E.g. "ساختاری که می‌ماند" -> "ساختاری که می ماند".
2. FAQ rename: "dadmor کیست؟" -> "dadmor چیست؟" (FA) and
   "Who is dadmor?" -> "What is dadmor?" (EN).
3. Inject a hand-drawn row icon into each home service-row <li> and each
   home tool-row card (FA + EN home pages).
4. Process the wordmark-only SVG (dadmor-halftone-wordmark.svg) into
   public/img: C2PA stripped, ink -> var(--lion-ink).
Run from ~/workspace/dadmor/v5. Idempotent.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ZWNJ = "\u200c"

ICONS = {
    "website-building": '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.7 2.4 4 5.2 4 8.5s-1.3 6.1-4 8.5c-2.7-2.4-4-5.2-4-8.5s1.3-6.1 4-8.5z"/>',
    "ui-ux-design": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    "business-model": '<path d="M6 20v-6M12 20V6M18 20v-9"/><path d="M3 20h18"/>',
    "documentation": '<path d="M6 2.5h8L19 8v13.5H6V2.5z"/><path d="M13.5 2.5V8H19"/><path d="M9 12.5h6M9 16h6"/>',
    "penetration-testing": '<path d="M12 2.5 19 5.5v6c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10v-6l7-3z"/><path d="m8.8 11.8 2.3 2.3 4.2-4.4"/>',
    "marketing-content": '<path d="m3 11 18-6v12L3 11z"/><path d="M7 15.5V19a1.5 1.5 0 0 0 3 0v-3"/>',
    "estimator": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7.5h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/>',
    "security-check": '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>',
}


def svg(key: str) -> str:
    inner = ICONS[key]
    return (
        '<span class="row-icon" aria-hidden="true">'
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>'
        "</span>"
    )


def clean_str(s: str) -> str:
    # Owner order (2026-11-05 21:37, RE-CONFIRMED 2026-11-06 00:49): NO
    # half-spaces anywhere in site text. A ZWNJ becomes a plain space
    # ("می‌ماند" -> "می ماند"), never a join. The 2026-11-05 22:32
    # exception that kept a ZWNJ in the brand tagline and the Gen Z
    # slogans is REVOKED (owner order 2026-11-06 00:49).
    s = s.replace(ZWNJ, " ")
    s = re.sub(r" {2,}", " ", s)
    s = s.replace("dadmor کیست؟", "dadmor چیست؟")
    s = s.replace("Who is dadmor?", "What is dadmor?")
    return s


def clean_obj(o):
    if isinstance(o, str):
        return clean_str(o)
    if isinstance(o, list):
        return [clean_obj(v) for v in o]
    if isinstance(o, dict):
        return {k: clean_obj(v) for k, v in o.items()}
    return o


def main() -> int:
    data_dir = ROOT / "src" / "data"
    total_zwnj = 0
    for path in sorted(data_dir.rglob("*.json")):
        text = path.read_text(encoding="utf-8")
        total_zwnj += text.count(ZWNJ)
        data = json.loads(text)
        data = clean_obj(data)
        # --- row icons: any service list (home + services index, FA + EN) ---
        # Detected by content (service-row-main), not by group class: the
        # services index list lives outside the home-services group.
        if path.name in ("index.json", "en__index.json", "services__index.json", "en__services__index.json"):

            def inject_service_icons(blocks):
                for b in blocks:
                    if not isinstance(b, dict):
                        continue
                    if b.get("t") == "list":
                        new_items = []
                        for it in b.get("items", []):
                            m = re.search(r"/services/([a-z-]+)/", it)
                            if m and m.group(1) in ICONS and "row-icon" not in it:
                                it = svg(m.group(1)) + it
                            new_items.append(it)
                        b["items"] = new_items
                    elif b.get("t") == "group":
                        inject_service_icons(b.get("blocks", []))

            inject_service_icons(data.get("blocks", []))
        if path.name in ("index.json", "en__index.json"):
            for group in data.get("blocks", []):
                if not isinstance(group, dict) or group.get("t") != "group":
                    continue
                cls = str(group.get("class", ""))
                if "home-tools" in cls:
                    for b in group.get("blocks", []):
                        if b.get("t") != "cards":
                            continue
                        new_items = []
                        for item in b.get("items", []):
                            html = item.get("html", "")
                            if "/tools/estimator/" in html and "row-icon" not in html:
                                html = html.replace(
                                    '<div class="tool-row">',
                                    '<div class="tool-row">' + svg("estimator"),
                                    1,
                                )
                            elif "/tools/security-check/" in html and "row-icon" not in html:
                                html = html.replace(
                                    '<div class="tool-row">',
                                    '<div class="tool-row">' + svg("security-check"),
                                    1,
                                )
                            item["html"] = html
                            new_items.append(item)
                        b["items"] = new_items
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    print(f"data JSON: stripped {total_zwnj} ZWNJ chars")

    # --- TS/TSX sources: same rule as the data (ZWNJ -> space, no
    # exceptions — the 2026-11-05 22:32 slogan exception is REVOKED,
    # owner order 2026-11-06 00:49). Never delete a ZWNJ outright:
    # deletion joins words ("میماند"). ---
    src_total = 0
    for path in sorted((ROOT / "src").rglob("*.ts*")):
        text = path.read_text(encoding="utf-8")
        n = text.count(ZWNJ)
        if n:
            src_total += n
            text = text.replace(ZWNJ, " ")
            text = re.sub(r" {2,}", " ", text)
            path.write_text(text, encoding="utf-8")
    print(f"src TS/TSX: spaced {src_total} ZWNJ chars")

    # --- wordmark-only SVG ---
    src_svg = Path.home() / "workspace" / "user" / "files" / "dadmor-halftone-wordmark.svg"
    out_svg = ROOT / "public" / "img" / "dadmor-halftone-wordmark.svg"
    text = src_svg.read_text(encoding="utf-8")
    text = re.sub(r"<metadata>.*?</metadata>", "", text, flags=re.S)
    text = text.replace(' xmlns:c2pa="http://c2pa.org/manifest"', "")
    text = text.replace('fill="#3a3587"', 'fill="var(--lion-ink)"')
    text = text.replace('stroke="#3a3587"', 'stroke="var(--lion-ink)"')
    assert "c2pa" not in text.lower(), "C2PA left in wordmark"
    assert "#3a3587" not in text, "hardcoded ink left in wordmark"
    out_svg.write_text(text, encoding="utf-8")
    print(f"wordmark -> {out_svg} ({len(text)} B)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
