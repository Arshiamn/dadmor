#!/usr/bin/env python3
"""Extract v4 built HTML pages into structured JSON for the React v5 rebuild.

Source: ~/workspace/dadmor/stage-c-v4-review/extracted/ (35 pages)
Output: <out>/pages/<slug>.json + <out>/site.json (nav/header/footer/meta)
Copy is preserved VERBATIM (inner HTML kept for rich text). No rewording.

Block types:
  hero      - home hero (eyebrow, h1 words, sub, ctas, stats, brand line)
  section   - {heading, id, blocks:[...]}
  p         - {html}
  list      - {ordered, items:[html]}
  table     - {headers:[html], rows:[[html]]}
  cards     - service-row / tool-row / work-item collections
  faq       - {items:[{q, a_html}]}
  cta       - {text, href, kind}
  note      - callout/notice blocks
  raw       - anything unclassified (kept as html, flagged for review)
"""
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

SRC = Path.home() / "workspace/dadmor/stage-c-v4-review/extracted"
OUT = Path.home() / "workspace/dadmor/v5/scripts/extracted"

VOID = {"meta", "link", "br", "hr", "img", "input", "source", "wbr", "col"}


class Node:
    def __init__(self, tag, attrs):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []  # Node | str

    def cls(self):
        return self.attrs.get("class", "")

    def text(self):
        out = []
        for c in self.children:
            out.append(c.text() if isinstance(c, Node) else c)
        return "".join(out)

    def html(self):
        out = []
        for c in self.children:
            out.append(c.outer() if isinstance(c, Node) else c)
        return "".join(out)

    def outer(self):
        a = "".join(f' {k}="{v}"' for k, v in self.attrs.items())
        if self.tag in VOID:
            return f"<{self.tag}{a}>"
        return f"<{self.tag}{a}>{self.html()}</{self.tag}>"

    def find_all(self, tag=None, cls=None):
        res = []
        for c in self.children:
            if isinstance(c, Node):
                if (tag is None or c.tag == tag) and (cls is None or cls in c.cls().split()):
                    res.append(c)
                res.extend(c.find_all(tag, cls))
        return res

    def find(self, tag=None, cls=None):
        r = self.find_all(tag, cls)
        return r[0] if r else None


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", {})
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if data:
            self.stack[-1].children.append(data)


def parse_file(path):
    p = Parser()
    p.feed(Path(path).read_text(encoding="utf-8"))
    return p.root


def clean_html(n):
    """Inner HTML of a node, whitespace-normalised."""
    return re.sub(r"\s+", " ", n.html()).strip()


def extract_table(n):
    headers, rows = [], []
    for tr in n.find_all("tr"):
        cells = [clean_html(c) for c in tr.children if isinstance(c, Node) and c.tag in ("th", "td")]
        if not cells:
            continue
        if any(isinstance(c, Node) and c.tag == "th" for c in tr.children):
            headers = cells
        else:
            rows.append(cells)
    return {"t": "table", "headers": headers, "rows": rows}


def extract_list(n):
    return {"t": "list", "ordered": n.tag == "ol",
            "items": [clean_html(li) for li in n.find_all("li")]}


def extract_cards(container, kind):
    items = []
    # The container itself can BE the row (a lone .tool-row div is passed
    # straight here) — its descendants alone never match, so the row was
    # silently dropped (home tool rows). Check it too.
    # Use the row's OUTER html so the wrapper div (and its class) survives;
    # inner html alone loses .tool-row / .service-row-main styling.
    for row in [container] + list(container.find_all("div")):
        c = row.cls()
        if kind == "service" and "service-row-main" in c:
            a = row.find("a")
            items.append({"title": row.find("h3").text().strip() if row.find("h3") else "",
                          "href": a.attrs.get("href", "") if a else "",
                          "html": re.sub(r"\s+", " ", row.outer()).strip()})
        elif kind == "tool" and c.strip() == "tool-row":
            a = row.find("a")
            items.append({"title": row.find("h3").text().strip() if row.find("h3") else "",
                          "href": a.attrs.get("href", "") if a else "",
                          "html": re.sub(r"\s+", " ", row.outer()).strip()})
        elif kind == "work" and "work-item" in c:
            a = row.find("a")
            items.append({"title": row.find("h3").text().strip() if row.find("h3") else "",
                          "href": a.attrs.get("href", "") if a else "",
                          "html": re.sub(r"\s+", " ", row.outer()).strip()})
    return {"t": "cards", "kind": kind, "items": items} if items else None


def extract_blocks(nodes):
    """Turn a list of sibling nodes into blocks."""
    blocks = []
    for n in nodes:
        if not isinstance(n, Node):
            if n.strip():
                blocks.append({"t": "raw", "html": n.strip()})
            continue
        tag, c = n.tag, n.cls()
        # The hero is rendered by the React Hero component, never twice.
        if tag == "section" and "hero" in c.split():
            continue
        if tag in ("h2", "h3"):
            blocks.append({"t": "heading", "level": int(tag[1]), "html": clean_html(n)})
        elif tag == "p":
            blocks.append({"t": "p", "html": clean_html(n)})
        elif tag in ("ul", "ol"):
            blocks.append(extract_list(n))
        elif tag == "table":
            blocks.append(extract_table(n))
        elif tag == "div" and "dot-divider" in c:
            blocks.append({"t": "divider"})
        elif tag == "div" and ("service-row-main" in c or c.strip() == "tool-row" or "work-item" in c):
            kind = "service" if "service-row" in c else ("tool" if c.strip() == "tool-row" else "work")
            card = extract_cards(n, kind)
            if card:
                blocks.append(card)
        elif tag == "div" and "home-faq-item" in c:
            q = n.find("h3")
            blocks.append({"t": "faq-item",
                           "q": q.text().strip() if q else "",
                           "a_html": clean_html(n)})
        elif tag in ("section", "div"):
            inner = extract_blocks(n.children)
            if inner:
                blocks.append({"t": "group", "class": c, "blocks": inner})
            elif n.text().strip():
                blocks.append({"t": "raw", "html": re.sub(r"\s+", " ", n.outer()).strip(), "class": c})
        elif tag == "a" and "btn" in c:
            blocks.append({"t": "cta", "text": n.text().strip(),
                           "href": n.attrs.get("href", ""), "class": c})
        else:
            if n.text().strip():
                blocks.append({"t": "raw", "html": re.sub(r"\s+", " ", n.outer()).strip(), "class": c, "tag": tag})
    return blocks


def extract_hero(main):
    hero = main.find("section", "hero")
    if not hero:
        return None
    txt = hero.find("div", "hero-text")
    lion = hero.find("div", "hero-lion")
    data = {"t": "hero", "html": clean_html(hero)}
    if txt:
        data["eyebrow"] = (txt.find("p").text().strip() if txt.find("p") else "")
        h1 = txt.find("h1")
        data["h1_html"] = clean_html(h1) if h1 else ""
        data["h1_text"] = re.sub(r"\s+", " ", h1.text()).strip() if h1 else ""
        ps = [clean_html(p) for p in txt.find_all("p")]
        data["paragraphs"] = ps
        data["ctas"] = [{"text": a.text().strip(), "href": a.attrs.get("href", ""), "class": a.cls()}
                       for a in txt.find_all("a") if "btn" in a.cls()]
    if lion:
        data["lion_html"] = clean_html(lion)
    return data


def extract_page(path, rel):
    root = parse_file(path)
    html = root.find("html")
    head = root.find("head")
    main = root.find("main")
    lang = html.attrs.get("lang", "fa") if html else "fa"
    title = head.find("title").text().strip() if head and head.find("title") else ""
    desc = ""
    canon, hreflangs, og = "", {}, {}
    if head:
        for m in head.find_all("meta"):
            a = m.attrs
            if a.get("name") == "description":
                desc = a.get("content", "")
            if a.get("property", "").startswith("og:"):
                og[a["property"][3:]] = a.get("content", "")
        for l in head.find_all("link"):
            a = l.attrs
            if a.get("rel") == "canonical":
                canon = a.get("href", "")
            if a.get("rel") == "alternate":
                hreflangs[a.get("hreflang", "")] = a.get("href", "")
    jsonld = []
    if head:
        for s in head.find_all("script"):
            if s.attrs.get("type") == "application/ld+json":
                try:
                    jsonld.append(json.loads(s.text()))
                except Exception:
                    pass
    blocks, hero = [], None
    if main is not None:
        hero = extract_hero(main)
        blocks = extract_blocks(main.children)
    return {"path": rel, "lang": lang, "title": title, "description": desc,
            "canonical": canon, "hreflang": hreflangs, "og": og,
            "jsonld": jsonld, "hero": hero, "blocks": blocks}


def extract_chrome(root, lang):
    """Header + footer HTML (shared chrome), per language."""
    header = root.find("header")
    footer = root.find("footer")
    return {"header_html": clean_html(header) if header else "",
            "footer_html": clean_html(footer) if footer else ""}


def main():
    pages = sorted(SRC.rglob("*.html"))
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "pages").mkdir(exist_ok=True)
    site = {"pages": [], "chrome": {}}
    problems = []
    for p in pages:
        rel = str(p.relative_to(SRC))
        try:
            data = extract_page(p, rel)
        except Exception as e:
            problems.append((rel, repr(e)))
            continue
        slug = rel.replace("/", "__").replace(".html", "")
        (OUT / "pages" / f"{slug}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        site["pages"].append({"path": rel, "lang": data["lang"], "title": data["title"],
                              "blocks": len(data["blocks"]), "hero": bool(data["hero"])})
        if rel in ("index.html", "en/index.html"):
            site["chrome"][data["lang"]] = extract_chrome(parse_file(p), data["lang"])
    (OUT / "site.json").write_text(json.dumps(site, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"pages: {len(site['pages'])}")
    for pg in site["pages"]:
        print(f"  {pg['path']:45s} {pg['lang']} blocks={pg['blocks']} hero={pg['hero']}")
    if problems:
        print("PROBLEMS:")
        for rel, e in problems:
            print(" ", rel, e)
    # raw-block audit: which pages carry unclassified content
    raw_pages = []
    for f in sorted((OUT / "pages").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        def has_raw(bs):
            for b in bs:
                if b.get("t") == "raw":
                    return True
                if b.get("t") == "group" and has_raw(b.get("blocks", [])):
                    return True
            return False
        if has_raw(d["blocks"]):
            raw_pages.append(d["path"])
    print(f"pages with raw (unclassified) blocks: {len(raw_pages)}")
    for r in raw_pages:
        print("  raw:", r)


if __name__ == "__main__":
    main()
