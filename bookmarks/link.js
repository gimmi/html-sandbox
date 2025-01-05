import { h, Fragment } from 'preact';

export default function Link({ link }) {
    const title = link.hlLen ?
        [
            link.title.slice(0, link.hlStart),
            h("mark", {}, link.title.slice(link.hlStart, link.hlStart + link.hlLen)),
            link.title.slice(link.hlStart + link.hlLen)
        ] :
        link.title

    const linkEl = link.href ?
        h("a", { href: link.href, class: "secondary", style: "display: block;", target: "_blank" }, title) :
        h("span", { style: "display: block;" }, title)

    const subLinks = link?.links || []
    const subLinksEl = subLinks.length ?
        h("div", { style: { paddingLeft: "1em", borderLeft: "1px dashed" }}, subLinks.map(subLink => h(Link, { link: subLink }))) :
        null

    return h(Fragment, {}, [ linkEl, subLinksEl ])
}
