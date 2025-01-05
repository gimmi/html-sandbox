import { h } from 'preact';

export default function Links({ children }) {
    return h("div", { style: { paddingLeft: "1em", borderLeft: "1px dashed" }}, children)
}
