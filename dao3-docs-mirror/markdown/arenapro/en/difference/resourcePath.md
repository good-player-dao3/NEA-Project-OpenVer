---
title: "Game Resource Paths"
source: "https://docs.dao3.fun/arenapro/en/difference/resourcePath.html"
---

# Game Resource Paths

Tip

**Reason for Modification:**In the original d.ts file provided by the officials, the path parameters for relevant API interfaces (such as creating entities, playing audio, etc.) were uniformly declared as the`string`type.

However, when a resource does not exist, forcing the code to execute will trigger a game error.

To implement code syntax hints, we have adopted a method of synchronizing map resources to generate resource types for constraints.

## Usage Example

![Example of using type constraints in a script](/arenapro/QQ20241222-160335.png)

## Best Practices

- It is recommended to synchronize resources at the beginning of development.
- Regularly check the resource synchronization status.
- Use type constraints to avoid runtime errors.
