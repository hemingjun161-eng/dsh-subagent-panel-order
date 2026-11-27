/**
 * Browser half of the subagent-panel-order bundle.
 *
 * The session header's subagent count opens a popup listing the root Session's
 * subagent catalog. That popup renders our footer slot occupant inside its scroll
 * body, so this module contributes one compact row there: an "in order / reversed"
 * switch. Everything else is CSS keyed on that row's own attribute, which keeps the
 * shipped list markup untouched:
 *
 *   - `[data-sap-order="desc"]` in the popup reverses the tree rows' paint order,
 *   - the popup's scrollbar gets a wider, higher-contrast thumb.
 *
 * No DOM outside this component is read or written, and the stylesheet is removed
 * when the plugin unloads.
 */

window.__ModuleLoader__.load({
  id: 'dsh-subagent-panel-order',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace for this bundle's visible copy. */
    const NS = 'subagent-panel-order'
    /** localStorage key holding the chosen order across sessions and restarts. */
    const STORAGE_KEY = 'dsh.subagent-panel-order'
    /** Attribute the reverse-order CSS matches inside the popup. */
    const ORDER_ATTR = 'data-sap-order'
    const ASC = 'asc'
    const DESC = 'desc'

    const DICTS = {
      en: {
        'order.label': 'List order',
        'order.asc': 'In order',
        'order.desc': 'Reversed',
        'order.hint': 'Reversed shows the last entry first',
      },
      zh: {
        'order.label': '列表排序',
        'order.asc': '正序',
        'order.desc': '倒序',
        'order.hint': '倒序时最后一项显示在最上面',
      },
      ja: {
        'order.label': '並び順',
        'order.asc': '昇順',
        'order.desc': '降順',
        'order.hint': '降順では最後の項目が先頭に表示されます',
      },
      de: {
        'order.label': 'Listenreihenfolge',
        'order.asc': 'Vorwärts',
        'order.desc': 'Umgekehrt',
        'order.hint': 'Umgekehrt zeigt den letzten Eintrag zuerst',
      },
      es: {
        'order.label': 'Orden de la lista',
        'order.asc': 'En orden',
        'order.desc': 'Invertido',
        'order.hint': 'Invertido muestra primero la última entrada',
      },
      fr: {
        'order.label': 'Ordre de la liste',
        'order.asc': 'Dans l’ordre',
        'order.desc': 'Inversé',
        'order.hint': 'Inversé affiche la dernière entrée en premier',
      },
      pt: {
        'order.label': 'Ordem da lista',
        'order.asc': 'Em ordem',
        'order.desc': 'Invertida',
        'order.hint': 'Invertida mostra a última entrada primeiro',
      },
      ru: {
        'order.label': 'Порядок списка',
        'order.asc': 'По порядку',
        'order.desc': 'Обратный',
        'order.hint': 'В обратном порядке последняя запись идёт первой',
      },
    }

    /**
     * The shipped popup keeps its scroll body at 5px with a faint thumb, which is
     * hard to see and hard to grab on a long catalog. The scrollbar rules repeat the
     * vendor pseudo-elements because the shipped thumb rule does not carry a usable
     * background of its own; the variables keep the popup's negative gutter margin
     * in step with the wider bar.
     */
    const STYLES = `
/* One knob drives the bar, its gutter and the popup inset: the shipped popup shifts its
   scroll body right by exactly the bar width, so the inset has to match or the bar clips. */
[data-subagent-panel] {
  --dsh-scrollbar-width: 16px;
  --dsh-scrollbar-thumb-border: 2px;
  padding-inline-end: var(--dsh-scrollbar-width);
}
[data-subagent-panel] > div:has(> [role="tree"]) {
  overscroll-behavior: contain;
}
[data-subagent-panel] > div:has(> [role="tree"])::-webkit-scrollbar {
  width: var(--dsh-scrollbar-width);
  height: var(--dsh-scrollbar-width);
}
[data-subagent-panel] > div:has(> [role="tree"])::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 6px;
}
[data-subagent-panel] > div:has(> [role="tree"])::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--dsw-alias-label-primary, #8a8a8a) 38%, transparent);
  background-clip: content-box;
  border: 2px solid transparent;
  border-radius: 999px;
  min-height: 32px;
}
[data-subagent-panel] > div:has(> [role="tree"])::-webkit-scrollbar-thumb:hover,
[data-subagent-panel] > div:has(> [role="tree"])::-webkit-scrollbar-thumb:active {
  background-color: color-mix(in srgb, var(--dsw-alias-label-primary, #8a8a8a) 62%, transparent);
}

/* Reversal: the tree and every nested group paint their rows bottom-up. Scoped to the
   tree so this switch's own role="group" row is never reversed. */
[data-subagent-panel]:has([${ORDER_ATTR}="${DESC}"]) [role="tree"],
[data-subagent-panel]:has([${ORDER_ATTR}="${DESC}"]) [role="tree"] [role="group"] {
  display: flex;
  flex-direction: column-reverse;
}

/* The switch itself: a sticky footer row inside the popup's scroll body. */
.sap-bar {
  position: sticky;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  margin: 6px 0 0;
  padding: 6px 2px 4px;
  border-top: 0.5px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.24));
  background: var(--dsw-alias-bg-layer-2, #2c2c2e);
  color: var(--dsw-alias-label-tertiary, #adb2b8);
  font-size: 11px;
  line-height: 16px;
}
.sap-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sap-group {
  display: inline-flex;
  flex: none;
  gap: 2px;
  padding: 2px;
  border-radius: var(--dsw-radius-sm, 8px);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #f9fafb) 6%, transparent);
}
.sap-btn {
  min-width: 40px;
  padding: 2px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary, #adb2b8);
  font: inherit;
  font-size: 11px;
  line-height: 16px;
  cursor: pointer;
  transition: color 120ms ease, background-color 120ms ease;
}
.sap-btn:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 1px;
  color: var(--dsw-alias-label-primary);
}
@media (hover: hover) {
  .sap-btn:hover {
    color: var(--dsw-alias-label-primary);
  }
}
.sap-btn-active {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #f9fafb) 18%, transparent);
  color: var(--dsw-alias-label-primary);
}
`

    function readOrder() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === DESC ? DESC : ASC
      } catch {
        return ASC
      }
    }

    function writeOrder(value) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // A blocked storage keeps the choice for this page only.
      }
    }

    /**
     * One order value shared by every mounted switch, so two open popups and any
     * re-render agree without re-reading storage.
     */
    const orderStore = (() => {
      let current = readOrder()
      const listeners = new Set()
      return {
        get: () => current,
        set(next) {
          if (next === current) return
          current = next
          writeOrder(next)
          for (const listener of [...listeners]) listener()
        },
        subscribe(listener) {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
      }
    })()

    /** Render the order switch as the popup's footer row. */
    function OrderBar(props) {
      const order = React.useSyncExternalStore(orderStore.subscribe, orderStore.get, orderStore.get)
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const option = (value, label) => h('button', {
        key: value,
        type: 'button',
        className: order === value ? 'sap-btn sap-btn-active' : 'sap-btn',
        'aria-pressed': order === value,
        'data-sap-value': value,
        onClick: () => { orderStore.set(value) },
      }, label)
      return h('div', {
        className: 'sap-bar',
        role: 'group',
        'aria-label': t('order.label'),
        [ORDER_ATTR]: order,
      },
        h('span', { className: 'sap-label', title: t('order.hint'), 'aria-hidden': true }, t('order.label')),
        h('span', { className: 'sap-group' },
          option(ASC, t('order.asc')),
          option(DESC, t('order.desc')),
        ),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICTS), 'subagent-panel-order: dictionaries')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.setAttribute('data-plugin', 'dsh-subagent-panel-order')
          style.textContent = STYLES
          document.head.appendChild(style)
          return () => { style.remove() }
        }, 'subagent-panel-order: styles')
        ctx.slots.inject('conversation.session.header.actions.subagent.footer', () => ctx.slots.register({
          name: 'conversation.session.header.actions.subagent.footer',
          id: 'subagent-panel-order',
          order: 10,
          locale: NS,
        }, OrderBar))
      },
    }
  },
})
