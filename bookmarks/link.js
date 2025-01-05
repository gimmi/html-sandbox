import { h } from 'preact';
import _ from 'lodash';

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

    const subLinkEls = _.map(link.links, subLink => h("li", {},
        h(Link, { link: subLink })
    ))

    return [
        linkEl,
        _.isEmpty(subLinkEls) ? null : h(Links, {}, subLinkEls)
    ]
}
