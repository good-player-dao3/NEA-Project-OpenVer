from __future__ import annotations

import argparse
import json
import re
import time
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen

ORIGIN = "https://docs.dao3.fun"
ALLOWED_HOST = "docs.dao3.fun"
START_PATHS = ("/api/", "/arena/", "/arenapro/")
USER_AGENT = "Mozilla/5.0 (compatible; Dao3DocsMirror/1.0)"

class LinkCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if value and name.lower() in {"href", "src", "poster"}:
                self.links.append(value)

def normalize_url(raw_url, base_url):
    absolute_url = urljoin(base_url, raw_url)
    parsed = urlsplit(absolute_url)
    if parsed.scheme not in {"http", "https"} or parsed.netloc != ALLOWED_HOST:
        return None
    path = unquote(parsed.path or "/")
    if ".." in Path(path).parts:
        return None
    encoded_path = quote(path, safe="/%:@!$&\'()*+,;=-._~")
    encoded_query = quote(parsed.query, safe="/%:@!$&\'()*+,;=-._~?[]")
    return urlunsplit(("https", ALLOWED_HOST, encoded_path, encoded_query, ""))

def local_path(output_root, source_url, content_type):
    parsed = urlsplit(source_url)
    relative_path = parsed.path.lstrip("/")
    if not relative_path or relative_path.endswith("/"):
        relative_path = f"{relative_path}index.html"
    if parsed.query:
        safe_query = re.sub(r"[^A-Za-z0-9._-]+", "_", parsed.query)
        relative_path = f"{relative_path}__query_{safe_query}"
    destination = output_root / relative_path
    if content_type.startswith("text/html") and destination.suffix == "":
        destination = destination.with_suffix(".html")
    return destination

def extract_links(text, base_url, content_type):
    raw_links = []
    if content_type == "text/html":
        collector = LinkCollector()
        collector.feed(text)
        raw_links.extend(collector.links)
    elif content_type == "text/css":
        raw_links.extend(re.findall(r"url\(\s*['\"]?([^'\")\s]+)", text, flags=re.I))
        raw_links.extend(re.findall(r"@import\s+(?:url\()?\s*['\"]([^'\"]+)", text, flags=re.I))
    elif content_type in {"application/javascript", "text/javascript"}:
        raw_links.extend(re.findall(r"(?:import|export)\s*(?:[^'\"]*?\s+from\s*)?['\"]([^'\"]+)['\"]", text))
        raw_links.extend(re.findall(r"import\(\s*['\"]([^'\"]+)['\"]\s*\)", text))
    return [url for raw in raw_links if (url := normalize_url(raw, base_url))]

def main():
    parser = argparse.ArgumentParser(description="Mirror public docs.dao3.fun content.")
    parser.add_argument("--output", type=Path, default=Path("site"))
    parser.add_argument("--delay", type=float, default=0.04)
    parser.add_argument("--max-urls", type=int, default=10000)
    args = parser.parse_args()

    output_root = args.output.resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    queue = deque(normalize_url(path, ORIGIN) for path in START_PATHS)
    queued = set(queue)
    downloaded = []
    failures = []

    while queue:
        source_url = queue.popleft()
        source_path = urlsplit(source_url).path.lstrip("/")
        if not source_path or source_path.endswith("/"):
            source_path = f"{source_path}index.html"
        existing_file = output_root / source_path
        if existing_file.is_file():
            final_url = source_url
            data = existing_file.read_bytes()
            suffix = existing_file.suffix.lower()
            content_type = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "application/javascript",
            }.get(suffix, "application/octet-stream")
            destination = existing_file
            print(f"REUSED  {destination.relative_to(output_root)}")
        else:
            try:
                request = Request(source_url, headers={"User-Agent": USER_AGENT})
                with urlopen(request, timeout=30) as response:
                    final_url = normalize_url(response.geturl(), source_url)
                    content_type = response.headers.get_content_type()
                    data = response.read()
            except (HTTPError, URLError, TimeoutError, UnicodeError) as error:
                failures.append({"url": source_url, "error": str(error)})
                print(f"FAILED {source_url}: {error}")
                continue
            if final_url is None:
                continue
            destination = local_path(output_root, final_url, content_type)

        text = None
        if content_type in {"text/html", "text/css", "application/javascript", "text/javascript"}:
            text = data.decode("utf-8", "replace").replace(ORIGIN, "")
            data = text.encode("utf-8")
        if not destination.exists():
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
            downloaded.append({"url": final_url, "file": str(destination.relative_to(output_root))})
            print(f"SAVED  {destination.relative_to(output_root)}")

        if text is not None:
            for next_url in extract_links(text, final_url, content_type):
                if next_url not in queued and len(queued) < args.max_urls:
                    queue.append(next_url)
                    queued.add(next_url)
        time.sleep(args.delay)

    manifest = {"origin": ORIGIN, "start_paths": START_PATHS, "downloaded": downloaded, "failures": failures}
    (output_root / "mirror-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (output_root / "README.txt").write_text(
        "Dao3 public documentation mirror.\n\n"
        "Browse locally with:\n  python -m http.server 8000 --directory .\n\n"
        "Open:\n  http://localhost:8000/api/\n  http://localhost:8000/arena/\n  http://localhost:8000/arenapro/\n",
        encoding="utf-8",
    )
    print(f"Completed: {len(downloaded)} files saved, {len(failures)} failed.")

if __name__ == "__main__":
    main()
