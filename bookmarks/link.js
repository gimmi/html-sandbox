import { h, Fragment } from 'preact';
import _ from 'lodash';

export default function Link({ link, level = 0 }) {
    const links = link?.links || []

    return [
        h("div", { style: "display: flex; align-items: center; column-gap: .3em;" }, [
            mkIndentEls(),
            mkIconEl(),
            mkTitleEl()
        ]),
        links.map(link => h(Link, { link, level: level + 1 }))
    ]

    function mkIndentEls() {
        return Array.from({ length: level })
            .map(_ => h("span", { style: "width: var(--pico-spacing); color: var(--pico-muted-color);" }, "❭"))
    }

    function mkIconEl() {
        let src = null
        if (link.href && link.favicon === true) {
            const origin = new URL(link.href).origin
            src = `https://www.google.com/s2/favicons?domain=${origin}&sz=16`
        } else if (_.isString(link.favicon)) {
            src = link.favicon
        }

        let el = null
        if (src) {
            el = h("img", { src, style: "width: 16px; height: 16px;" })
        }

        return el
    }

    function mkTitleEl() {
        const match = link.match || [0, 0]
        let titleEl = link.title

        if (match[1] - match[0]) {
            titleEl = [
                link.title.slice(0, match[0]),
                h("mark", {}, link.title.slice(match[0], match[1])),
                link.title.slice(match[1])
            ]
        }

        if (links.length) {
            titleEl = h("b", {}, titleEl)
        }

        if (link.href) {
            titleEl = h("a", { href: link.href, class: "secondary", target: "_blank" }, titleEl)
        }

        return titleEl
    }
}
