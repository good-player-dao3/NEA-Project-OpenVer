# LokiBox Browser

LokiBox Browser is an Electron desktop shell for the existing LokiBox code.

## Development

```bash
pnpm install
pnpm desktop:start
```

## Native DAO3 login

Open `Profiles` → `Account Manager` (or `Ctrl+Shift+P`) to save and activate a
DAO3 profile. Profiles are encrypted with Electron's operating-system secure
credential store.

On activation the browser first applies the selected User-Agent to its default
Chromium session and open views, then writes the `.dao3.fun` `authorization`
and `box-auth2` cookies in parallel before returning to the DAO3 home page.
Both values are required. Additional DAO3 cookies can be supplied as a JSON
array when creating the profile. Existing DAO3 cookies are preserved until you
explicitly deactivate the account.

## Windows package

```bash
pnpm desktop:package
```