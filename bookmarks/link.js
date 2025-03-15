import { h, Fragment } from 'preact';
import _ from 'lodash';

export default function Link({ link }) {
    const linkEl = link.href ? 
        mklink() : 
        h("span", { style: "display: block;" }, mktitle())

    const subLinks = link?.links || []
    const subLinksEl = subLinks.length ?
        h("div", { style: { paddingLeft: "1em", borderLeft: "1px dashed" }}, subLinks.map(subLink => h(Link, { link: subLink }))) :
        null

    return h(Fragment, {}, [ linkEl, subLinksEl ])

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

    function mklink() {
        // const favicon = "https://s2.googleusercontent.com/s2/favicons?domain=" + new URL(link.href).hostname
        const title = mktitle()
        const favicon = link.favicon === true ? 
            new URL(link.href).origin + "/favicon.ico" :
            link.favicon

        return _.isString(favicon) ?
            h("a", { href: link.href, class: "secondary", style: "display: flex; align-items: center; column-gap: 4px;", target: "_blank" }, 
                h("img", { src: favicon, style: "width: 16px; height: 16px;" }),
                h("span", {}, title)
            ) :
            h("a", { href: link.href, class: "secondary", style: "display: block;", target: "_blank" }, title)
    }
}
