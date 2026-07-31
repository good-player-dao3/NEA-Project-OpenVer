---
title: "ArenaPro Client Asset Management"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/uploadResources.html"
---

# ArenaPro Client Asset Management

With this approach, you can completely decouple from the in-map file management system and manage asset indexes and references locally in your project. This makes versioning, collaboration, and rollbacks much easier. The generated local enum indexes can be shared with anyone and stored in any repository. They work across different maps out of the box—copy, reference, and go.

> Important: Local Management vs. Engine Storage
>
> - Both the index and the references are locally managed assets, independent of the map's internal file management. Put them under Git (or any VCS) for teamwork and auditability.
> - No dependency on the map resource library: you don’t need to write the index into the map or rely on map permissions—your code can discover and use assets by name immediately.
> - Truly cross-map: the same set of indexes can be reused in different projects/maps. Share with your team and use it instantly (out of the box).

### Start Batch Upload

1. Open VS Code and press`Ctrl + Shift + P`to open the Command Palette.
2. Search and run:
  - Batch Upload Pictures: “批量上传图片（本地维护）”
  - Batch Upload Audio: “批量上传音频（本地维护）”
3. In the system file picker:
  - Enable multi-select and choose files to upload.
  - Picture extensions:`jfif, pjpeg, jpg, jpeg, pjp, png`
  - Audio extensions:`mp3, wav, ogg, webm`
4. Click Upload. The extension uploads items one by one and appends enum entries to local index files.
5. A summary notification will appear:
  - How many items were skipped due to duplicate identifier (key) or duplicate value.

### Output and File Locations

- Output root:`client/UiIndex/assets/`
- Files and exports:
  - Pictures:`GamePictureUrl.ts`exports`export enum GamePictureUrl { ... }`
  - Audio:`GameAudioUrl.ts`exports`export enum GameAudioUrl { ... }`

File headers include a description and generation timestamp. Enum entries are sorted by key name, use two-space indentation, and end with a comma.

### Key Name Generation (Important)

- Take the file basename (without extension) and convert it with a PascalCase-like rule:
  - Non-alphanumeric separators are split into words; capitalize each and join them.
  - If the first character would be invalid, prefix with`_`.
  - Examples:
    - `main-bg.png`→`MainBg`
    - `1_logo.png`→`_1Logo`
    - `ui icon large.png`→`UiIconLarge`

> Tip: Prefer clear English words, digits,`-`, or`_`. Avoid spaces and special characters to reduce surprises in generated keys.

### Deduplication and Notifications

During`appendToEnumIndex()`the following checks are performed:

- Duplicate identifier (key): skip if a key already exists.
- Duplicate value (URL/hash): skip if a value already exists.

A notification summarizes:

- Total skipped count, including sample items for “identifier duplicated” and “value duplicated”.

If nothing was added but some were skipped, a warning with skip reasons is shown.

### Referencing Assets in Code

Exported files use standard enums. Example usage:

ts

```
// Example: picture
import { GamePictureUrl } from "@client/UiIndex/assets/GamePictureUrl";

const heroUrl = GamePictureUrl.HeroMain; // assuming this key exists
```

ts

```
// Example: audio
import { GameAudioUrl } from "@client/UiIndex/assets/GameAudioUrl";

const clickSound = GameAudioUrl.UiClick; // assuming this key exists
```

### Pro Tip: Add JSDoc Comments for Hover Hints and Better IntelliSense

Add a JSDoc block`/** ... */`above each enum item to provide usage notes, size/duration, and caveats. These will show up on hover and in IntelliSense.

ts

```
// client/UiIndex/assets/GamePictureUrl.ts
export enum GamePictureUrl {
  /** Main hero illustration (home banner), 1920x1080, PNG, ≤200KB */
  HeroMain = "https://.../hero-main.png",

  /** Base UI icons (common), 64x64, sprite sheet */
  UiIconBase = "https://.../ui-icon-base.png",
}
```

ts

```
// client/UiIndex/assets/GameAudioUrl.ts
export enum GameAudioUrl {
  /** UI click SFX, ~120ms, suggested volume -6dB */
  UiClick = "https://.../ui-click.mp3",

  /** Achievement unlock SFX, ~900ms, with rising tail */
  AchievementUnlock = "https://.../achievement-unlock.mp3",
}
```

> Note: Enum files are appended. New entries won’t overwrite existing entries and comments. If you rename keys or delete and recreate entries, older comments may be lost. Add comments when keys stabilize, or annotate stable/common keys.

> Suggested team template for consistency (usage/location | size/duration | format | notes):`/** Usage(Location) | Size/Duration | Format | Notes */`

### Helper: Preview Images Directly in the Editor

With the VS Code extension[Gutter Preview](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-gutter-preview), you can preview images in the editor gutter while coding, improving QA and asset checks.

- Install: search “Gutter Preview” in the VS Code marketplace.
- Use: when a line contains an image URL or a local path, a thumbnail appears in the gutter; hover to enlarge.
- Best for: quickly verifying assets in`GamePictureUrl`, UI configs, styles, or JSON.
- Compatibility: common image formats and http/https, relative/absolute paths (see extension docs).
- Performance: for very large images or slow networks, temporarily disable or limit preview size.

### FAQ

- Q: Why were no new entries added after uploading?
  - A: Likely due to duplicate identifiers or values. The extension will show the skip reasons. Rename files (which affects keys) or confirm whether the same asset URL was uploaded twice.
- Q: Key names don’t look right?
  - A: Keys are derived from the file basename to PascalCase. Adjust filenames to your naming conventions (clear English/digits/`-`/`_`), and avoid special characters.
- Q: Why “local management”? Could I lose files?
  - A: The index isn’t stored in the BOX3 engine. It’s in a local output folder. Add it to your project and version control to prevent loss.
