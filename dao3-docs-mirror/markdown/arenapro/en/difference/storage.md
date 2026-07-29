---
title: "Data Space"
source: "https://docs.dao3.fun/arenapro/en/difference/storage.html"
---

# Data Space

This document describes the data space feature of the`GameDataStorage`API, detailing its optimization background and usage examples.

API Documentation:[GameDataStorage](/api/GameDataStorage/getSpace.md)

## Optimization Background

### Reason for Modification

In the original d.ts file provided by the officials, the`value`field of the`GameDataStorage`API interface was uniformly declared as the`any`type (more specifically, the official custom`JSONValue`type, which can accommodate strings, numbers, booleans, objects, and arrays).

To ensure type consistency within the data space, we have introduced generic constraints. This optimization significantly improves code readability and the accuracy of type checking.

## Usage Examples

### Default Usage (Without Generics)

By default, the`value`field is of type`JSONValue`:

![](/arenapro/QQ20241022-192639.png)

### Usage with Generic Constraints

After adding generic constraints, the type of the`value`field becomes more specific:

![](/arenapro/QQ20241022-193007.png)
