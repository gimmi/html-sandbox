import { h } from 'preact';

export default function Links({ children }) {
    return h("ul", { style: "list-style-type: none;" }, children)
}
