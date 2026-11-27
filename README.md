# Subagent list order

A DSH bundle that adds a small order switch to the subagent list popup in the session
header, and makes that popup's scrollbar easier to use.

## Install

DSH installs bundles from npm, a Git repository, a tarball, or a local directory. From
GitHub, use the repository spec in **Plugins → + Add plugin**:

```
github:<owner>/dsh-subagent-panel-order
```

Pin a commit with `github:<owner>/dsh-subagent-panel-order#<40-hex sha>`. The bundle needs
DSH `0.2.2-rc.5` or later (`engines.dsh`), and declares no runtime dependencies: the browser
half imports only React from the page.

## What it changes

- **Order switch** — the popup's last row holds `In order` / `Reversed` (正序 / 倒序 in
  Chinese). The choice is stored in this browser and reused everywhere the popup opens.
  Reversed paints the catalog bottom-up, so the last entry appears first; row content,
  token counts, durations, branch disclosure and the open-in-sidebar button are unchanged.
- **Scrollbar** — the popup's scroll area goes from a 5px faint bar to a 16px rounded bar
  whose 12px thumb is easy to see and drag, with a stronger hover state and the wheel scroll
  contained inside the list.

## How it works

The switch is a contribution to the shipped
`conversation.session.header.actions.subagent.footer` slot, which the popup renders inside
its own scroll body. The rest is CSS keyed on that row's `data-sap-order` attribute, so the
list markup, React tree and keyboard model of the shipped component are untouched.

## Limitations

- Reversal is paint order, not data order: with `Reversed` active, `ArrowUp` / `ArrowDown`
  still walk the catalog's own order, so they read inverted against the screen.
- The switch exists only in the root Session's count popup, which is where the shipped
  footer slot is declared. A child Session's title switcher keeps the shipped order.
- The popup is styled through its stable `data-subagent-panel` attribute, its tree
  `role="tree"` / `role="group"` roles, and its scroll body. If a future DSH release renames
  them, the switch stays functional but the reversal and scrollbar rules stop matching.
- Turning the plugin off restores the shipped order and scrollbar; no data is written outside
  this browser's `localStorage`.

## Index

`index.json` is a plugin market index (format 1) for this bundle. Add its raw URL in
**Plugins → Experimental plugins → Custom plugin indexes** to browse it from **Discover**.

## License

MIT. See [LICENSE](LICENSE).

