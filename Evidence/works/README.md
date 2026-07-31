# Local Works

`works/` is the local catalog for maps used to develop and validate NEA compatibility.

Actual exported projects, scripts, screenshots, capture metadata, and other private work material belong under:

```text
works/private/<work-id>/
```

`works/private/` is ignored by Git. Never move private work source into tracked fixtures. Convert only the minimum required behavior into redacted ABI evidence, synthetic conformance fixtures, and compatibility reports.

Each private work directory should contain a `work-manifest.json` recording:

- a local stable identifier;
- the display label supplied by the owner;
- the original capture directory;
- export completeness and known missing data;
- generated analysis paths.

The original `dump/private/live-captures/` directory remains the immutable capture provenance. The work catalog contains a development copy and must not replace or delete that source evidence.

Compatibility tooling imports these directories as anonymous script-corpus samples. Work names and identifiers must never appear in Runtime branches, ABI identifiers, conformance behavior, or generated compatibility reports.
