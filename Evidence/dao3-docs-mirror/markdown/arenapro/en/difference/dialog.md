---
title: "entity.player.dialog"
source: "https://docs.dao3.fun/arenapro/en/difference/dialog.html"
---

# entity.player.dialog

Warning

Official API Documentation:[dialog](/api/GamePlayerEntity/chat.md#dialog)

Tip

**Reason for Modification:**The original d.ts file provided by the officials for this API had an interface definition that did not match TypeScript's coding standards, causing difficulties for many creators. We have made necessary optimizations and adjustments.

## Functional Classification

### Dialog Types

- **Text Dialog**: Displays plain text information.
- **Option Dialog**: Provides multiple options for the user to choose from.
- **Input Dialog**: Allows the user to input text.

## Usage Examples

### Text Dialog

![](/arenapro/text.webp)

### Option Dialog

![](/arenapro/select.webp)

### Input Dialog

![](/arenapro/input.webp)

## Advantages and Features

1. **Type Safety**: By defining clear types, TypeScript can catch potential errors at compile time, such as passing arguments of the wrong type or omitting required properties.
2. **Clear API Documentation**: The type definitions themselves serve as documentation, clearly explaining what parameters each API call requires and what their types are.
3. **Enhanced Code Readability**: When other creators read your code, the type definitions provide extra context, making it easier for them to understand your intent.
4. **Reduced Runtime Errors**: With static type checking, you can catch many common errors before the code runs, reducing the likelihood of runtime issues.

## Best Practices

- Use dialog types appropriately to ensure a good user interaction experience.
- Keep dialog content concise and easy to read.
- Pay attention to the visual design of the dialog to ensure it is consistent with the overall style of the game.
