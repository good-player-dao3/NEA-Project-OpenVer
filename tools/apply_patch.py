#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
from pathlib import Path
import sys


class PatchError(RuntimeError):
    pass


def safe_path(root: Path, value: str) -> Path:
    path = (root / value).resolve()
    try:
        path.relative_to(root)
    except ValueError as exc:
        raise PatchError(f"path escapes workspace: {value}") from exc
    return path


def parse_sections(lines: list[str]) -> list[tuple[str, str, list[str]]]:
    if not lines or lines[0] != "*** Begin Patch":
        raise PatchError("patch must start with '*** Begin Patch'")
    sections: list[tuple[str, str, list[str]]] = []
    index = 1
    while index < len(lines):
        line = lines[index]
        if line == "*** End Patch":
            if index != len(lines) - 1:
                raise PatchError("unexpected content after '*** End Patch'")
            return sections
        prefixes = {
            "*** Add File: ": "add",
            "*** Update File: ": "update",
            "*** Delete File: ": "delete",
        }
        kind = next((name for prefix, name in prefixes.items() if line.startswith(prefix)), None)
        if kind is None:
            raise PatchError(f"expected file section, got: {line}")
        prefix = next(prefix for prefix, name in prefixes.items() if name == kind)
        file_name = line[len(prefix):].strip()
        if not file_name:
            raise PatchError("empty file path")
        index += 1
        body: list[str] = []
        while index < len(lines) and not lines[index].startswith("*** "):
            body.append(lines[index])
            index += 1
        sections.append((kind, file_name, body))
    raise PatchError("missing '*** End Patch'")


def apply_add(path: Path, body: list[str], check: bool) -> None:
    if path.exists():
        raise PatchError(f"file already exists: {path}")
    output: list[str] = []
    for line in body:
        if not line.startswith("+"):
            raise PatchError(f"add-file line must start with '+': {line}")
        output.append(line[1:])
    if not check:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(("\n".join(output) + ("\n" if output else "")).encode("utf-8"))


def find_chunk(source: list[str], chunk: list[str], start: int) -> int:
    if not chunk:
        return start
    limit = len(source) - len(chunk) + 1
    for index in range(start, max(start, limit)):
        if source[index:index + len(chunk)] == chunk:
            return index
    raise PatchError("update hunk context was not found")


def apply_update(path: Path, body: list[str], check: bool) -> None:
    if not path.is_file():
        raise PatchError(f"file does not exist: {path}")
    source_text = path.read_text(encoding="utf-8")
    source = source_text.splitlines()
    output = source[:]
    search_start = 0
    index = 0
    if not body or not body[0].startswith("@@"):
        raise PatchError("update section must contain at least one '@@' hunk")
    while index < len(body):
        if not body[index].startswith("@@"):
            raise PatchError(f"expected '@@' hunk header, got: {body[index]}")
        index += 1
        old_chunk: list[str] = []
        new_chunk: list[str] = []
        while index < len(body) and not body[index].startswith("@@"):
            line = body[index]
            if not line:
                raise PatchError("hunk lines require a prefix: ' ', '+', or '-'")
            marker, value = line[0], line[1:]
            if marker == " ":
                old_chunk.append(value)
                new_chunk.append(value)
            elif marker == "-":
                old_chunk.append(value)
            elif marker == "+":
                new_chunk.append(value)
            else:
                raise PatchError(f"invalid hunk line: {line}")
            index += 1
        position = find_chunk(output, old_chunk, search_start)
        output[position:position + len(old_chunk)] = new_chunk
        search_start = position + len(new_chunk)
    if not check:
        trailing_newline = source_text.endswith(("\n", "\r"))
        text = "\n".join(output) + ("\n" if trailing_newline or output else "")
        path.write_bytes(text.encode("utf-8"))


def apply_delete(path: Path, body: list[str], check: bool) -> None:
    if body:
        raise PatchError("delete section cannot contain body lines")
    if not path.is_file():
        raise PatchError(f"file does not exist: {path}")
    if not check:
        path.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="Apply Codex-style patch text safely.")
    parser.add_argument("--root", default=os.getcwd(), help="workspace root (default: cwd)")
    parser.add_argument("--check", action="store_true", help="validate without writing")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    raw = sys.stdin.read().replace("\r\n", "\n").replace("\r", "\n")
    lines = raw.splitlines()
    try:
        sections = parse_sections(lines)
        for kind, file_name, body in sections:
            path = safe_path(root, file_name)
            if kind == "add":
                apply_add(path, body, args.check)
            elif kind == "update":
                apply_update(path, body, args.check)
            else:
                apply_delete(path, body, args.check)
        action = "Checked" if args.check else "Applied"
        print(f"{action} {len(sections)} file section(s).")
        return 0
    except (OSError, UnicodeError, PatchError) as error:
        print(f"apply_patch: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
