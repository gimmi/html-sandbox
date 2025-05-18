import { h } from 'preact';

export default function ContextSelector({ contexts, context, setContext }) {
    return h("input", { type: "button", value: context, onClick, tabindex: "-1" })

    function onClick() {
        const keys = Object.keys(contexts)
        if (keys.length === 0) {
            return
        }

        const idx = keys.indexOf(context)
        if (idx === -1) {
            setContext(keys[0])
        } else if (idx + 1 === keys.length) {
            setContext(keys[0])
        } else {
            setContext(keys[idx + 1])
        }
    }
}
