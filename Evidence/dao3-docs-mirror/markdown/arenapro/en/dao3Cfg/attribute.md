---
title: "dao3Cfg Configuration Attributes"
source: "https://docs.dao3.fun/arenapro/en/dao3Cfg/attribute.html"
---

# dao3Cfg Configuration Attributes

In the configuration file**dao3.config.json**, you can set the compilation and upload behavior. Below is a detailed description of the configuration structure and each attribute.

## Configuration Example

json

```
{
  "ArenaPro": {
    "npmPackage": null,
    "packageManager": "npm",
    "file": {
      "typescript": {
        "server": {
          "entry": "src/App.ts",
          "ECS": false,
          "development": true
        },
        "client": {
          "entry": "src/clientApp.ts",
          "ECS": false,
          "development": true,
          "uiIndexPrefix": ""
        },
        "developmentAll": null,
        "jsUpdate": true
      }
    },
    "outputAndUpdate": [
      "bundle.js",
      {
        "name": "bundle2.js",
        "serverEntry": "src/App.ts",
        "clientEntry": "src/clientApp.ts",
        "description": "Example of a second code module, can be changed."
      }
    ],
    "map": {
      "id": "",
      "editHash": "",
      "playHash": ""
    }
  }
}
```

## Attribute Descriptions

### Server-side Configuration

| Attribute | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `file.typescript.server` | ✓ | object |  | Arena**server-side**project configuration |
| `file.typescript.server.entry` |  | string | App.ts | Arena**server-side**project entry file |
| `file.typescript.server.ECS` |  | boolean | false | Whether to enable ECS architecture for the Arena**server-side**project |
| `file.typescript.server.development` |  | boolean | true | Server-side project compilation mode, defaults to development mode, priority is lower than`developmentAll` |

### Client-side Configuration

| Attribute | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `file.typescript.client` | ✓ | object |  | Arena**client-side**project configuration |
| `file.typescript.client.entry` |  | string | clientApp.ts | Arena**client-side**project entry file |
| `file.typescript.client.ECS` |  | boolean | false | Whether to enable ECS architecture for the Arena**client-side**project |
| `file.typescript.client.development` |  | boolean | true | Client-side project compilation mode, defaults to development mode, priority is lower than`developmentAll` |
| `file.typescript.client.uiIndexPrefix` |  | string | "" | UI Index prefix |

### Common Compilation Settings

| Attribute | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `file.typescript.developmentAll` |  | boolean \| null | null | Whether to enable webpack's creator mode? If enabled,**client**and**server**code will not be compressed or obfuscated. If null, this attribute is ignored. |
| `file.typescript.jsUpdate` |  | boolean | true | Whether to automatically upload to the map after compiling the script? If disabled, it only compiles without uploading. |

### File Output and Upload

| Attribute | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `outputAndUpdate` |  | object |  | Current compilation file configuration, defaults to the first data entry. |
| `outputAndUpdate.name` | ✓ | string | bundle.js | File name to be uploaded to the Box3 script editor, must have a`.js`suffix. |
| `outputAndUpdate.serverEntry` | ✓ | string |  | Server-side entry file to be uploaded to the Box3 script editor. |
| `outputAndUpdate.clientEntry` | ✓ | string |  | Client-side entry file to be uploaded to the Box3 script editor. |
| `outputAndUpdate.description` |  | string |  | A note for the current configuration, can be used to distinguish configurations. |

### Map Information

| Attribute | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `map.id` | ✓ | string | "" | The**extended map ID**corresponding to the current Arena project. |
| `map.editHash` | ✓ | string | "" | The**creator-end Hash**of the extended map corresponding to the current Arena project. |
| `map.playHash` |  | string | "" | The**player-end Hash**of the extended map corresponding to the current Arena project. |

### Special Configuration

| Attribute | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `npmPackage` |  | "server" \| "client" |  | Is the current project a Box3 component library (npm package)? If so, specify the end name to stop building the other end and speed up the process. |
| `packageManager` |  | "npm" \| "yarn"\| "pnpm" \| "bun" | "npm" | The recommended package manager for the current project |
