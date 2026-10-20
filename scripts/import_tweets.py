#!/usr/bin/env python3
"""Import @buddhaa_eth archive (JSON từ twscrape) → bài viết cho web The Classical Gazette.

- Gộp thread (chuỗi tweet nối tiếp của cùng tác giả) thành 1 bài.
- Phân loại → category của site.
- Sinh ra:
    supabase/seed_posts.sql     (INSERT ... ON CONFLICT DO UPDATE → chạy trong Supabase SQL Editor)
    public/archive-posts.json   (dữ liệu cho chế độ không có Supabase / static fallback)
    IMPORT_REPORT.md            (thống kê + top bài)

Chạy:
    python3 scripts/import_tweets.py ~/Documents/x-archive-buddhaa/raw/full_buddhaa_eth_20261018.json
    python3 scripts/import_tweets.py <json> --include-trading
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import os
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTHOR = "Buddha.eth"
AUTHOR_ROLE = "Khảo luận Triết học, Chiêm tinh & Tâm thức"
DEFAULT_COVER = ""

# ---------- phân loại ----------
RE_TRADING = re.compile(
    r"(\$[A-Z]{2,10}\b|giá|chart|nến|entry|target|pump|dump|long|short|altcoin|"
    r"bitcoin|btc|eth\b|sol\b|sóng|kháng cự|vùng hỗ trợ|volume|funding|liquid|"
    r"market maker|bull|bear|thị trường)",
    re.I,
)
RE_ASTRO = re.compile(
    r"(chiêm tinh|bản đồ sao|sao (thuỷ|kim|hoả|hỏa|mộc|thổ|thiên vương|hải vương|diêm vương)|"
    r"mặt trăng|mặt trời|la hầu|kế đô|nakshatra|transit|vedic|jyotish|huyền học|"
    r"cung (bạch dương|kim ngưu|song tử|cự giải|sư tử|xử nữ|thiên bình|bọ cạp|nhân mã|ma kết|bảo bình|song ngư)|"
    r"góc chiếu|nhà số|nhà thứ)",
    re.I,
)
RE_PHILO = re.compile(
    r"(triết|bài học|cuộc sống|bản thân|nội tâm|chữa lành|trưởng thành|nhận thức|niềm tin|"
    r"định mệnh|nghiệp|nhân quả|vũ trụ|năng lượng|tâm linh|thiền|phật|bụt|đức hạnh|"
    r"đọc sách|suy ngẫm|chiêm nghiệm|ý nghĩa|tâm thức|tỉnh thức)",
    re.I,
)
PLANETS = {
    "sao thuỷ": "Thủy Tinh", "sao thủy": "Thủy Tinh", "sao kim": "Kim Tinh",
    "sao hoả": "Hỏa Tinh", "sao hỏa": "Hỏa Tinh", "sao mộc": "Mộc Tinh",
    "sao thổ": "Thổ Tinh", "la hầu": "La Hầu", "kế đô": "Kế Đô",
    "mặt trăng": "Mặt Trăng", "mặt trời": "Mặt Trời",
}

# bài quảng cáo dự án / kêu gọi đầu cơ — không phải nội dung lưu trữ
RE_PROMO = re.compile(
    r"(\bscam\b|airdrop|giveaway|whitelist|presale|\bido\b|ref link|referral|"
    r"kèo thơm|kèo ngon|sign up|đăng ký ngay|link đăng ký|testnet|snapshot|"
    r"claim token|point \d|kiếm tiền online|pumpfun)\b",
    re.I,
)
EMOJI = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF"
    "\U00002B00-\U00002BFF"
    "\U0000FE0F\U0000200D\U0000203C\U00002049"
    "]+",
    flags=re.UNICODE,
)


def classify(text: str) -> str:
    a, p, t = RE_ASTRO.search(text), RE_PHILO.search(text), RE_TRADING.search(text)
    if a and t:
        return "chu-ky"
    if a:
        return "chiem-tinh"
    if p:
        return "triet-hoc"
    if t:
        return "thi-truong"
    return "khac"


CATEGORY = {
    "chiem-tinh": "Chiêm Tinh Vệ Đà",
    "triet-hoc": "Triết Học & Tỉnh Thức",
    "chu-ky": "Chu Kỳ Vũ Trụ & Thời Cuộc",
    "thi-truong": "Thị Trường & Chu Kỳ",
    "khac": "Triết Học & Tỉnh Thức",
}


# ---------- slug ----------
def strip_accents(s: str) -> str:
    s = s.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s


def slugify(s: str, maxlen: int = 70) -> str:
    s = strip_accents(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    if len(s) > maxlen:
        s = s[:maxlen].rsplit("-", 1)[0]
    return s or "bai-viet"


# ---------- gộp thread ----------
def build_chains(rows: list[dict]) -> list[list[dict]]:
    by_id = {t["id"]: t for t in rows}
    children: dict[str, list[dict]] = defaultdict(list)
    roots = []
    for t in rows:
        p = t.get("in_reply_to")
        if p and p in by_id:
            children[p].append(t)
        else:
            roots.append(t)  # bài gốc hoặc reply cho người ngoài (vẫn tính là 1 bài riêng)
    chains = []
    for r in roots:
        chain, cur = [r], r
        seen = {r["id"]}
        while children.get(cur["id"]):
            nxt = sorted(children[cur["id"]], key=lambda x: x["created_at"])[0]
            if nxt["id"] in seen:
                break
            seen.add(nxt["id"])
            chain.append(nxt)
            cur = nxt
        chains.append(chain)
    chains.sort(key=lambda c: c[0]["created_at"])
    return chains


# ---------- nội dung ----------
def make_title(text: str) -> str:
    first = text.strip().split("\n")[0].strip()
    first = EMOJI.sub("", first).strip()
    first = re.sub(r"\s{2,}", " ", first)
    first = re.sub(r"^[\W_]+|(?<=.)[\W_]+$", "", first)
    if 12 <= len(first) <= 130:
        return first
    # cắt theo câu
    m = re.match(r"(.{20,120}?[\.\!\?\:])\s", text.strip(), re.S)
    if m:
        return EMOJI.sub("", m.group(1)).strip()
    out = " ".join(EMOJI.sub("", text).split())[:110].rstrip(" ,.;:")
    return (out + "…") if len(out) >= 100 else out


def tweet_text(t: dict) -> str:
    txt = t["text"]
    txt = re.sub(r"https?://t\.co/\S+", "", txt)  # bỏ link rút gọn chết
    return txt.strip()


def is_self_retweet(chain: list[dict]) -> bool:
    head = tweet_text(chain[0])
    return head.startswith("RT @")


def is_conversation(chain: list[dict]) -> bool:
    """Chuỗi bắt đầu bằng reply cho người khác → là hội thoại, không phải bài viết."""
    root = chain[0]
    if root.get("is_reply"):
        return True
    return tweet_text(root).lstrip().startswith("@")


def make_post(chain: list[dict], used_slugs: set[str]) -> dict | None:
    parts = [tweet_text(t) for t in chain]
    parts = [p for p in parts if p]
    if not parts:
        return None
    content = "\n\n".join(parts).strip()
    if len(content) < 120:
        return None  # quá ngắn, không thành bài

    root = chain[0]
    title = make_title(parts[0])
    if not re.search(r"[a-zA-ZÀ-ỹ]{4}", title):
        return None  # title rác (toàn emoji / ký tự lạ)
    rest = content[len(parts[0]):].strip() or content
    rest = EMOJI.sub("", rest).strip()
    excerpt = " ".join(rest.split())[:200].rstrip(" ,.;:")
    if len(rest) > 200:
        excerpt += "…"

    words = len(content.split())
    read_time = max(2, round(words / 200))

    cat_key = classify(content)
    tags: list[str] = []
    for p, tag in PLANETS.items():
        if p in content.lower():
            tags.append(tag)
    tags += [h.lstrip("#") for h in re.findall(r"#(\w{2,20})", content)][:4]
    tags += [c for c in re.findall(r"\$([A-Z]{2,10})\b", content)][:3]
    # dedupe giữ thứ tự
    if not tags:
        tags = [CATEGORY[cat_key].split(" & ")[0]]
    tags = list(dict.fromkeys(tags))[:6]

    base = slugify(title)
    slug, n = base, 2
    while slug in used_slugs:
        slug = f"{base}-{n}"
        n += 1
    used_slugs.add(slug)

    media = []
    for t in chain:
        media += [m for m in (t.get("media") or []) if m]
    created = root["created_at"]
    if created.endswith("+00:00"):
        created = created.replace("+00:00", "Z")

    # bài "đủ tầm" → published; còn lại để draft cho chủ nick tự duyệt trong admin
    strong = (
        cat_key == "chiem-tinh"
        or (cat_key == "triet-hoc" and len(content) >= 400)
        or (cat_key == "chu-ky" and len(content) >= 700)
    )
    status = "published" if strong else "draft"

    return {
        "id": f"tw-{root['id']}",
        "title": title,
        "slug": slug,
        "excerpt": excerpt,
        "content": content,
        "cover_image": media[0] if media else DEFAULT_COVER,
        "category": CATEGORY[cat_key],
        "tags": tags,
        "status": status,
        "created_at": created,
        "updated_at": created,
        "author_name": AUTHOR,
        "author_role": AUTHOR_ROLE,
        "read_time": read_time,
        "views_count": 0,
        "featured": False,
        "seo_title": title[:70],
        "seo_description": excerpt[:160],
        "seo_keywords": ", ".join(tags).lower(),
        "_meta": {
            "cat_key": cat_key,
            "tweets": len(chain),
            "source_url": root["url"],
            "likes": sum(t.get("likes") or 0 for t in chain),
            "media": media,
        },
    }


def sql_quote(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, list):
        arr = ",".join('"' + str(x).replace('"', '\\"') + '"' for x in v) or ""
        return "'{" + arr + "}'"
    return "'" + str(v).replace("'", "''") + "'"


COLS = [
    "id", "title", "slug", "excerpt", "content", "cover_image", "category", "tags",
    "status", "author_name", "author_role", "read_time", "views_count", "featured",
    "seo_title", "seo_description", "seo_keywords", "created_at", "updated_at",
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("json_path")
    ap.add_argument("--include-trading", action="store_true", help="gồm cả bài trading thuần")
    ap.add_argument("--include-short-other", action="store_true")
    ap.add_argument("--include-replies", action="store_true", help="gồm cả reply/hội thoại")
    ap.add_argument(
        "--exclude-ids",
        help="file JSON chứa mảng id bài đã xoá trên web (tải từ Admin → Tải ID) — sẽ không import lại",
    )
    args = ap.parse_args()

    raw = json.load(open(args.json_path))
    rows = raw["tweets"]
    chains = build_chains(rows)
    print(f"{len(rows)} tweet → {len(chains)} chuỗi/bài")

    used: set[str] = set()
    seen_text: set[str] = set()
    excluded: set[str] = set()
    # Luôn đọc danh sách xoá vĩnh viễn trong repo (do scripts/delete_posts.mjs ghi)
    default_exclude = Path(__file__).resolve().parent.parent / "public" / "deleted-post-ids.json"
    if default_exclude.exists():
        try:
            excluded |= set(json.load(open(default_exclude)))
        except Exception as e:
            print(f"⚠️  không đọc được {default_exclude.name}: {e}")
    if args.exclude_ids:
        excluded |= set(json.load(open(args.exclude_ids)))
    if excluded:
        print(f"loại trừ {len(excluded)} id đã xoá vĩnh viễn")
    posts, skipped = [], Counter()
    for ch in chains:
        if f"tw-{ch[0]['id']}" in excluded:
            skipped["đã xoá trên web (bỏ)"] += 1
            continue
        if is_self_retweet(ch):
            skipped["self-retweet (bỏ)"] += 1
            continue
        if is_conversation(ch) and not args.include_replies:
            skipped["reply/hội thoại (bỏ)"] += 1
            continue
        p = make_post(ch, used)
        if not p:
            skipped["quá ngắn"] += 1
            continue
        k = p["_meta"]["cat_key"]
        if RE_PROMO.search(p["content"]) and k not in ("chiem-tinh", "triet-hoc"):
            skipped["promo/airdrop (bỏ)"] += 1
            continue
        if k == "thi-truong" and not args.include_trading:
            skipped["trading thuần (bỏ)"] += 1
            continue
        if k == "khac" and len(p["content"]) < 400 and not args.include_short_other:
            skipped["khác + ngắn (bỏ)"] += 1
            continue
        # trùng nội dung (ví dụ đăng lại bài cũ) → giữ bản đầu
        key = " ".join(p["content"].split())[:300].lower()
        if key in seen_text:
            skipped["trùng nội dung (bỏ)"] += 1
            continue
        seen_text.add(key)
        posts.append(p)

    posts.sort(key=lambda x: x["created_at"], reverse=True)
    print(f"→ {len(posts)} bài · bỏ {sum(skipped.values())}: {dict(skipped)}")
    pub = sum(1 for p in posts if p["status"] == "published")
    print(f"   published: {pub} · draft: {len(posts) - pub}")
    by_cat = Counter(p["category"] for p in posts)
    print("theo category:", dict(by_cat))

    os.makedirs(f"{HERE}/supabase", exist_ok=True)
    os.makedirs(f"{HERE}/public", exist_ok=True)

    # --- SQL seed ---
    lines = [
        "-- Auto-generated by scripts/import_tweets.py — import @buddhaa_eth archive",
        f"-- {len(posts)} bài · nguồn: {os.path.basename(args.json_path)}",
        "BEGIN;",
    ]
    for p in posts:
        vals = [sql_quote(p.get(c)) for c in COLS]
        lines.append(
            f"INSERT INTO public.posts ({', '.join(COLS)}) VALUES ({', '.join(vals)})\n"
            "ON CONFLICT (id) DO UPDATE SET "
            + ", ".join(f"{c}=EXCLUDED.{c}" for c in COLS if c not in ("id", "created_at"))
            + ";"
        )
    lines.append("COMMIT;")
    open(f"{HERE}/supabase/seed_posts.sql", "w").write("\n".join(lines) + "\n")

    # --- JSON cho static fallback ---
    clean = [{k: v for k, v in p.items() if k != "_meta"} for p in posts]
    json.dump(clean, open(f"{HERE}/public/archive-posts.json", "w"), ensure_ascii=False)

    # --- báo cáo ---
    top = sorted(posts, key=lambda p: p["_meta"]["likes"], reverse=True)[:15]
    rep = [
        "# IMPORT REPORT — @buddhaa_eth",
        "",
        f"- Nguồn: `{os.path.basename(args.json_path)}` ({len(rows)} tweet)",
        f"- Chuỗi/bài sau khi gộp thread: **{len(posts)}**",
        f"- published: **{sum(1 for p in posts if p['status'] == 'published')}** · draft: {sum(1 for p in posts if p['status'] == 'draft')}",
        f"- Bỏ: {dict(skipped) or '—'}",
        "",
        "## Theo chuyên mục",
        *[f"- {k}: {v}" for k, v in by_cat.most_common()],
        "",
        "## Bài được tương tác nhiều nhất",
        "",
    ]
    for p in top:
        rep.append(f"- **{p['title']}** — ❤ {p['_meta']['likes']} · {p['created_at'][:10]} · {p['_meta']['tweets']} tweet · /{p['slug']}")
    open(f"{HERE}/IMPORT_REPORT.md", "w").write("\n".join(rep) + "\n")
    print(f"✔ seed_posts.sql · public/archive-posts.json · IMPORT_REPORT.md")


if __name__ == "__main__":
    main()
