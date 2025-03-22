import { h, Fragment } from 'preact';
import _ from 'lodash';

export default function Link({ link, level = 0 }) {
    const links = link?.links || []
    const title = mktitle()
    const favicon = mkfavicon()
    
    let els = [
        Array.from({ length: level }).map(_ => h("div", { style: { padding: "0 .3em 0 .3em" }}, "❭"))
    ]

    if (favicon) {
        els.push(h("img", { src: favicon, style: "width: 16px; height: 16px;" }))
    }

    if (link.href) {
        els.push(
            h("a", { href: link.href, class: "secondary", target: "_blank" }, title)
        )
    } else {
        els.push(title)
    }

    return [
        h("div", { style: "display: flex; align-items: center; column-gap: .3em;" }, els),
        links.map(link => h(Link, { link, level: level + 1 }))
    ]

    function mktitle() {
        const match = link.match || [0, 0]

        if (match[1] - match[0]) {
            return [
                link.title.slice(0, match[0]),
                h("mark", {}, link.title.slice(match[0], match[1])),
                link.title.slice(match[1])
            ]
        }

        return link.title
    }

    function mkfavicon() {
        if (link.href && link.favicon === true) {
            return new URL(link.href).origin + "/favicon.ico"
        } else if (_.isString(link.favicon)) {
            return link.favicon
        }

        return null
    }
}
