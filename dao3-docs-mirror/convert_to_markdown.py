from __future__ import annotations

import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit

from bs4 import BeautifulSoup, NavigableString, Tag

mirror_root = Path(r'D:\Projects\Gaming\dao3-docs-mirror')
site_root = mirror_root / 'site'
output_root = mirror_root / 'markdown'
rendered_path = mirror_root / 'rendered-pages.json'

skip_classes = {
    'header-anchor', 'line-numbers-wrapper', 'copy', 'vp-code-group',
    'VPDocAsideOutline', 'VPDocOutlineItem', 'outline-link', 'sr-only'
}


def clean_text(value: str) -> str:
    value = value.replace('\u200b', '').replace('\xa0', ' ')
    value = re.sub(r'[ \t]+', ' ', value)
    value = re.sub(r' *\n *', '\n', value)
    return value.strip()


def has_skipped_class(node: Tag) -> bool:
    return any(class_name in skip_classes for class_name in node.get('class', []))


def markdown_href(href: str) -> str:
    if not href:
        return href
    parsed = urlsplit(href)
    if parsed.scheme or href.startswith('#'):
        return href
    path = parsed.path
    if path.endswith('.html'):
        path = f'{path[:-5]}.md'
    if path.endswith('/'):
        path = f'{path}index.md'
    suffix = f'?{parsed.query}' if parsed.query else ''
    fragment = f'#{parsed.fragment}' if parsed.fragment else ''
    return f'{path}{suffix}{fragment}'


def inline(node) -> str:
    if isinstance(node, NavigableString):
        return clean_text(str(node))
    if not isinstance(node, Tag) or has_skipped_class(node):
        return ''
    name = node.name.lower()
    if name == 'br':
        return '  \n'
    if name == 'img':
        return f"![{clean_text(node.get('alt', ''))}]({node.get('src', '')})"
    content = ''.join(inline(child) for child in node.children)
    if name == 'code':
        content = content.replace('`', '\\`')
        return f'`{content}`' if content else ''
    if name in {'strong', 'b'}:
        return f'**{content}**' if content else ''
    if name in {'em', 'i'}:
        return f'*{content}*' if content else ''
    if name == 'a':
        href = markdown_href(node.get('href', ''))
        return f'[{content}]({href})' if content and href else content
    return content


def list_block(node: Tag, depth: int = 0) -> str:
    ordered = node.name.lower() == 'ol'
    lines = []
    direct_items = [child for child in node.children if isinstance(child, Tag) and child.name.lower() == 'li']
    for index, item in enumerate(direct_items, start=1):
        parts = []
        nested = []
        for child in item.children:
            if isinstance(child, Tag) and child.name.lower() in {'ul', 'ol'}:
                nested.append(child)
            else:
                parts.append(inline(child))
        marker = f'{index}.' if ordered else '-'
        text = clean_text(''.join(parts))
        lines.append(f"{'  ' * depth}{marker} {text}".rstrip())
        for child in nested:
            lines.append(list_block(child, depth + 1))
    return '\n'.join(lines)


def table_block(node: Tag) -> str:
    rows = []
    for row in node.find_all('tr'):
        cells = [clean_text(inline(cell)).replace('|', '\\|').replace('\n', '<br>') for cell in row.find_all(['th', 'td'], recursive=False)]
        if cells:
            rows.append(cells)
    if not rows:
        return ''
    width = max(len(row) for row in rows)
    rows = [row + [''] * (width - len(row)) for row in rows]
    header = rows[0]
    output = [f"| {' | '.join(header)} |", f"| {' | '.join(['---'] * width)} |"]
    output.extend(f"| {' | '.join(row)} |" for row in rows[1:])
    return '\n'.join(output)


def block(node) -> str:
    if isinstance(node, NavigableString):
        return clean_text(str(node))
    if not isinstance(node, Tag) or has_skipped_class(node):
        return ''
    name = node.name.lower()
    if name in {'script', 'style', 'button', 'svg'}:
        return ''
    if name in {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
        return f"{'#' * int(name[1])} {clean_text(inline(node))}"
    if name == 'p':
        return clean_text(inline(node))
    if name == 'pre':
        code = node.find('code')
        content = code.get_text('', strip=False) if code else node.get_text('', strip=False)
        content = content.replace('\r\n', '\n').strip('\n')
        classes = ' '.join(node.get('class', [])) + ' ' + (' '.join(code.get('class', [])) if code else '')
        match = re.search(r'language-([A-Za-z0-9_+-]+)', classes)
        language = match.group(1) if match else ''
        return f'```{language}\n{content}\n```'
    if name in {'ul', 'ol'}:
        return list_block(node)
    if name == 'blockquote':
        content = '\n\n'.join(filter(None, (block(child) for child in node.children)))
        return '\n'.join(f'> {line}' if line else '>' for line in content.splitlines())
    if name == 'table':
        return table_block(node)
    if name == 'hr':
        return '---'
    if name in {'[document]', 'div', 'section', 'article', 'main', 'details', 'summary', 'figure', 'figcaption'}:
        return '\n\n'.join(filter(None, (block(child) for child in node.children)))
    return clean_text(inline(node))


def page_markdown(page: dict) -> str:
    soup = BeautifulSoup(page['html'], 'html.parser')
    body = block(soup)
    body = re.sub(r'\n{3,}', '\n\n', body).strip()
    title = clean_text(page['title'].split(' | ')[0])
    source = f"https://docs.dao3.fun{page['route']}"
    frontmatter = f'---\ntitle: {json.dumps(title, ensure_ascii=False)}\nsource: {json.dumps(source)}\n---\n\n'
    return frontmatter + body + '\n'


if output_root.exists():
    shutil.rmtree(output_root)
output_root.mkdir(parents=True)

rendered = json.loads(rendered_path.read_text(encoding='utf-8'))
written = []
for page in rendered['pages']:
    relative = Path(page['route'].lstrip('/')).with_suffix('.md')
    destination = output_root / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(page_markdown(page), encoding='utf-8')
    written.append(str(relative))

asset_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'}
copied_assets = []
for source in site_root.rglob('*'):
    if source.is_file() and source.suffix.lower() in asset_extensions:
        target = output_root / source.relative_to(site_root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied_assets.append(str(target.relative_to(output_root)))

readme = """# Dao3 文档 Markdown 导出

本文档由 `https://docs.dao3.fun/` 的公开页面在本地渲染后导出。

- `api/`：ArenaEdit API 文档
- `arena/`：Arena 文档
- `arenapro/`：ArenaPro 文档
- `voxa/`：Voxa 文档

原始静态镜像位于同级 `../site/` 目录。
"""
(output_root / 'README.md').write_text(readme, encoding='utf-8')
manifest = {
    'source': 'https://docs.dao3.fun/',
    'markdown_files': written,
    'copied_assets': copied_assets,
    'unavailable_source_routes': rendered['errors'],
}
(output_root / 'conversion-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Markdown files: {len(written) + 1}')
print(f'Copied image assets: {len(copied_assets)}')
print(f'Unavailable source routes: {len(rendered["errors"])}')
