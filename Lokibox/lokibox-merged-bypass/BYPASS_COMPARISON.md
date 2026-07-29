# Bypass comparison

This branch uses `origin/main` as its base and selectively ports the useful
parts of the local `codex/bypass-v2` work.

## Online (`origin/main`)

| Mechanism | Implementation | Notes |
| --- | --- | --- |
| Blink | Queues typed game `NetInput` calls | Stable and scoped to movement input |
| FakeLag | Keeps a configurable delayed `NetInput` queue | Replays valid input gradually |
| Fly / Ghost | Hooks player flags through typed core adapters | Fits the current architecture |
| AntiVoid / AntiVoidHook | Tracks a safe position or hooks write permission | Includes conservative and aggressive variants |
| AntiKnockBack | Detects HP loss, attenuates velocity, optional position restore | Configurable |
| VoidHook / HitBox / Criticals | Body flags, bounding-box and velocity hooks | Online-only combat bypasses |
| CircleStrafe | Applies velocity around the selected target | Online replacement for the old TargetStrafe |

## Local (`codex/bypass-v2` plus uncommitted work)

| Mechanism | Implementation | Merge decision |
| --- | --- | --- |
| Raw WebSocket blocking | Replaces browser/WebSocket send functions | Not ported; too broad and conflicts with the typed interceptor |
| Blink / FakeLag | Raw socket blocking and packet queue | Kept the online implementation |
| TP with block | Blocks all outgoing WS traffic around a local position write | Not ported; may block heartbeat and unrelated protocol traffic |
| RubberFly | Writes camera-forward velocity while held | Covered by online Fly/JetPack |
| RubberbandRebound | Rewrites local position after server snapback | Not ported; can cause correction loops |
| RubberbandGuard | Detects excursion followed by return to an older position | Ported and adapted to the Feature system |
| SmartMode | Toggles old modules based on game phase and risk | Not directly portable; old module IDs and settings no longer exist |
| AntiKick | Periodic idle movement | Covered by online AntiAFK |
| GodMode / Invisible | Client-side health/skin writes | Cosmetic only; not a server bypass |

## Merged user-experience improvements

- `RubberbandGuard` is enabled by default and can pause high-risk movement and
  combat features after a detected server correction.
- Blink and FakeLag now have exclusive ownership of the input queue. Enabling
  one while the other is active produces a visible error and reverts the
  conflicting toggle.
- Blink displays armed and flush feedback, including the number of buffered
  inputs.
- The input queue is capped at 600 entries to prevent unbounded memory usage
  and extreme replay bursts.

The merge deliberately avoids claiming that client-side position rewrites can
defeat a server-authoritative correction. Those mechanisms are treated as
recovery and risk controls instead of guaranteed bypasses.
