import { h } from 'preact';

import Links from "./links.js"

export default function Link({ link }) {
    const title = link.hlLen ?
        [
            link.title.slice(0, link.hlStart),
            h("mark", {}, link.title.slice(link.hlStart, link.hlStart + link.hlLen)),
            link.title.slice(link.hlStart + link.hlLen)
        ] :
        link.title

    const linkEl = link.href ?
        h("a", { href: link.href, class: "secondary", target: "_blank" }, title) :
        h("span", {}, title)

    const subLinks = link?.links || []
    const subLinksEl = subLinks.length ?
        h(Links, {}, subLinks.map(subLink => h(Link, { link: subLink }))) :
        null

    return h("li", { style: { listStyle: "none" }}, [ linkEl, subLinksEl ])
}
