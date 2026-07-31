# Open Version Policy

`NEA Project OpenVer` is the publishable repository for the NEA preservation and compatibility effort. Its role is to make the implementation, reproducible reports, and vetted evidence available without exposing material that belongs to a local operator, an account, or a privately captured work.

## Included

- Executable compatibility code and deterministic generated ABI/report artifacts.
- Public documentation mirrors, historical declarations, transport sources, and bundles that are already reviewed for publication in this repository.
- Sanitized work metadata and reproducible import/runtime tooling.

## Excluded

- Browser profiles, cookie stores, login databases, OAuth material, credentials, session state, and token-bearing URLs.
- `dump/private/`, `works/private/`, local reference worktrees, `.workspace/`, and the user-owned `NEA-Project.7z` archive.
- Private map exports, script source, captures, or any asset whose publication status is unclear.

## Publishing Checklist

Before committing or pushing the open version:

1. Inspect `git status --short` and confirm that ignored/private locations are absent.
2. Check staged paths for the excluded locations listed above.
3. Keep generated ABI/report files in sync with the implementation that produced them.
4. Use evidence-based compatibility language: `compatible`, `partial`, `recovered-only`, `declared-only`, or an explicit evidence-deferred note.
5. Do not rewrite history merely to hide an uncertain file. Stop and audit it first.

## Community

- Open repository: <https://github.com/ForgottenArch/NEA-Project-OpenVer>
- QQ group ? **???? - dao4.fun ??????**: <https://qm.qq.com/q/Mixf3L5xeO>

The community is for preservation research and implementation discussion. Never share credentials, private captures, private map sources, or unreviewed personal data there.
