#!/usr/bin/env python3
"""Rebuild the neon-v2 lion SVGs into theme-aware files for the React v5 build.

Fixes v4 bugs B2 + B3 at the source:
  B2: the eye path had no id, so <use href="#eyes"> rendered nothing.
  B3: fills were hardcoded per file, so light mode showed the dark lion
      with green eyes (the -light files were never referenced).

What this does per file:
  - wraps all <circle> in <g class="lion-dots"> (breathing pulse target)
  - the 2-subpath path (eyes) -> class="lion-eyes" id="eyes"
    fill="var(--lion-eyes)"
  - the 53-subpath path (face) -> class="lion-face" id="face"
    fill="var(--lion-ink)"
  - any other path (wordmark) -> fill="var(--lion-ink)"
  - root <svg> gets id="lion-root" on its main group when present
  - no hardcoded ink/eye colour remains in the file

Theme variables (defined in the app CSS):
  dark:  --lion-ink: #8c80ff; --lion-eyes: #00e676
  light: --lion-ink: #3a3587; --lion-eyes: #3a3587  (owner: no green in light)

Mono variants are generated from the same files with var() replaced by a
single colour (#111111 for mono-black, #ffffff for mono-white).

Source: ~/workspace/dadmor/neon-identity/lion-neon-v2-*.svg (+ light)
Output: ~/workspace/dadmor/v5/public/img/<canonical>.svg
"""
import re
from pathlib import Path

SRC = Path.home() / "workspace/dadmor/neon-identity"
OUT = Path.home() / "workspace/dadmor/v5/public/img"
OUT.mkdir(parents=True, exist_ok=True)

# canonical name -> (dark source, light source or None)
FILES = {
    "dadmor-halftone-icon.svg": ("lion-neon-v2-icon.svg", "lion-neon-v2-light-icon.svg"),
    "dadmor-halftone-logo.svg": ("lion-neon-v2-logo.svg", "lion-neon-v2-light-logo.svg"),
    "hero-lion-d0.svg": ("hero-lion-d0-neon-v2.svg", "hero-lion-d0-neon-v2-light.svg"),
    "hero-lion-d1.svg": ("hero-lion-d1-neon-v2.svg", "hero-lion-d1-neon-v2-light.svg"),
    "hero-lion-d2.svg": ("hero-lion-d2-neon-v2.svg", "hero-lion-d2-neon-v2-light.svg"),
    "hero-lion-d3.svg": ("hero-lion-d3-neon-v2.svg", "hero-lion-d3-neon-v2-light.svg"),
}

EYE_COLORS = {"#00e676", "#008a5a"}
INK_COLORS = {"#8c80ff", "#3a3587"}


def process(text):
    # 1. wrap circles in a group (only if not already wrapped)
    circles = re.findall(r"<circle[^>]*/>", text)
    if circles and 'class="lion-dots"' not in text:
        first = circles[0]
        last = circles[-1]
        start = text.index(first)
        end = text.index(last) + len(last)
        inner = text[start:end]
        text = text[:start] + '<g class="lion-dots">' + inner + "</g>" + text[end:]

    # 2. rewrite paths
    def repl_path(m):
        tag = m.group(0)
        d = re.search(r'd="([^"]+)"', tag)
        n_sub = d.group(1).count("M") if d else 0
        fill = re.search(r'fill="([^"]+)"', tag)
        f = fill.group(1).lower() if fill else ""
        tag = re.sub(r'\sfill="[^"]+"', "", tag)
        # The source tags are self-closed (<path ... />). Strip the WHOLE
        # self-close (2 chars), not just the ">" — stripping 1 char left a
        # "/" in front of the new attributes, so the class/id/fill landed
        # OUTSIDE the tag: the eyes inherited the violet group fill and
        # had no .lion-eyes class, so no green and no glow (QA FAIL).
        # The rebuilt tag MUST stay self-closed ("/>"): ending it with a
        # bare ">" left the face path OPEN, so the eyes path nested INSIDE
        # it in the HTML parse — and SVG does not render children of a
        # <path>. The face rendered, the eyes never did (QA FAIL again,
        # 2026-11-05 23:28: blank face, no green pixels at all).
        base = tag[:-2] if tag.endswith('/>') else tag[:-1]
        if n_sub == 2:
            tag = base + ' class="lion-eyes" id="eyes" fill="var(--lion-eyes)"/>'
        elif n_sub == 53:
            tag = base + ' class="lion-face" id="face" fill="var(--lion-ink)"/>'
        elif f in EYE_COLORS:
            tag = base + ' class="lion-eyes" id="eyes" fill="var(--lion-eyes)"/>'
        elif f in INK_COLORS or f == "":
            tag = base + ' fill="var(--lion-ink)"/>'
        else:
            tag = base + f' fill="{f}"/>'
        return tag

    text = re.sub(r"<path[^>]*>", repl_path, text)
    # 3. any remaining hardcoded ink/eye fills on other elements
    text = re.sub(r'fill="#(?:00e676|008a5a)"', 'fill="var(--lion-eyes)"', text, flags=re.I)
    text = re.sub(r'fill="#(?:8c80ff|3a3587)"', 'fill="var(--lion-ink)"', text, flags=re.I)
    # 4. hardcoded STROKES (the wordmark letters are stroked paths)
    text = re.sub(r'stroke="#(?:00e676|008a5a)"', 'stroke="var(--lion-eyes)"', text, flags=re.I)
    text = re.sub(r'stroke="#(?:8c80ff|3a3587)"', 'stroke="var(--lion-ink)"', text, flags=re.I)
    # 5. the outer group is the lion root (drop-in compatible with legacy
    #    <use href="#lion-root"> markup)
    if 'id="lion-root"' not in text:
        text = re.sub(r"<g(\s)", r'<g id="lion-root"\1', text, count=1)
    return text


def verify(text, name):
    n_circles = len(re.findall(r"<circle", text))
    # The eyes/face attributes must be INSIDE one well-formed SELF-CLOSED
    # tag — a plain substring check passed the malformed '"/ class='
    # version, and a bare ">" passed the tag-shaped check while leaving
    # the face path OPEN (the eyes nested inside it and never rendered).
    has_eyes = bool(re.search(r'<path[^>]*class="lion-eyes"[^>]*fill="var\(--lion-eyes\)"[^>]*/>', text))
    has_face = bool(re.search(r'<path[^>]*class="lion-face"[^>]*fill="var\(--lion-ink\)"[^>]*/>', text))
    has_dots = 'class="lion-dots"' in text
    has_root = 'id="lion-root"' in text
    malformed = '"/ class=' in text
    hard = re.findall(r'(?:fill|stroke)="#(?:00e676|008a5a|8c80ff|3a3587)"', text, flags=re.I)
    # Nesting check: parse as HTML (the browser's rules) and confirm the
    # eyes path's parent is the group, not another <path>.
    from html.parser import HTMLParser
    class _P(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.stack = []
            self.eyes_parent = None
        def handle_starttag(self, tag, attrs):
            d = dict(attrs)
            if tag == 'path' and d.get('class') == 'lion-eyes':
                self.eyes_parent = self.stack[-1] if self.stack else None
            self.stack.append(tag)
        def handle_startendtag(self, tag, attrs):
            d = dict(attrs)
            if tag == 'path' and d.get('class') == 'lion-eyes':
                self.eyes_parent = self.stack[-1] if self.stack else None
        def handle_endtag(self, tag):
            if tag in self.stack:
                while self.stack and self.stack[-1] != tag:
                    self.stack.pop()
                self.stack.pop()
    _p = _P()
    _p.feed(text)
    nested = _p.eyes_parent != 'g'
    ok = has_eyes and has_face and has_dots and has_root and not hard and not malformed and not nested
    print(f"  {name}: circles={n_circles} eyes={has_eyes} face={has_face} "
          f"dots-group={has_dots} root={has_root} hardcoded-colours={len(hard)} malformed={malformed} eyes-nested={nested} -> {'OK' if ok else 'CHECK'}")
    return ok


all_ok = True
for canon, (dark, light) in FILES.items():
    text = (SRC / dark).read_text(encoding="utf-8")
    out = process(text)
    (OUT / canon).write_text(out, encoding="utf-8")
    all_ok &= verify(out, canon)
    # mono variants (single colour, no vars)
    for mono, col in (("mono-black", "#111111"), ("mono-white", "#ffffff")):
        m = out.replace("var(--lion-eyes)", col).replace("var(--lion-ink)", col)
        stem = canon.replace(".svg", f"-{mono}.svg")
        (OUT / stem).write_text(m, encoding="utf-8")
        print(f"  {stem}: mono {col}")

print("ALL OK" if all_ok else "SOME FILES NEED CHECKING")
