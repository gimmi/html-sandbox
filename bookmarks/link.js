import { h } from 'preact';
import _ from 'lodash';

export default function Link({ link }) {
    const linkEl = _.isString(link.href) ?
        h("a", { href: link.href }, link.title) :
        h("span", {}, link.title)

    const subLinkEls = _.map(link.links, subLink => h("li", {},
        h(Link, { link: subLink })
    ))

    return [
        linkEl,
        _.isEmpty(subLinkEls) ? null : h("ul", {}, subLinkEls)
    ]
}
