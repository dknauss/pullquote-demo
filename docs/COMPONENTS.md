# Component ownership and editing

text is saved in post content by save.js. Preserve its reading order and accessibility behavior. Keep static output and provide deprecations before changing its saved markup.

Follow [the shared workflow](COMPONENT-WORKFLOW.md). `components.json` is the checked inventory.

## Contract inventory

| Component | Source | Editing / update model |
|---|---|---|
| `pullquote-demo/article-extract` | [`src/article-extract/block.json`](../src/article-extract/block.json) | Declared fields/supports below |

## `pullquote-demo/article-extract`

Declared attributes: text; existing style controls are listed in supports. Attribute declarations are not proof of visible UI controls.

Saved output remains in post content; existing instances require compatibility/deprecations before markup changes

Declared style supports (existing controls, not a newly restricted API):

```json
{
  "html": false,
  "color": {
    "text": true,
    "background": true
  },
  "spacing": {
    "margin": true,
    "padding": true
  },
  "typography": {
    "fontSize": true,
    "lineHeight": true
  }
}
```

## Validation and release

Run `python3 tools/check-components.py`. CI checks the inventory and interfaces.
Use `tools/audit-design-overrides.php` via read-only WP-CLI before a design release.
Review the existing repository test/build instructions as well; this checker is not an application test.
Changing files does not reconcile database overrides or rewrite existing inserted patterns.
