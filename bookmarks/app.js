import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import _ from 'lodash';
import SettingsDialog from "./settings-dialog.js"
import Link from "./link.js"

export default function App() {
    const [searchText, setSearchText] = useState("");
    const [links, setLinks] = useLinks();
    const dialogRef = useRef(null);

    // TODO replace with https://github.com/farzher/fuzzysort
    const rxs = searchText
        .split(" ")
        .filter(Boolean)
        .map(_.escapeRegExp)
        .map(x => new RegExp(x, "id"))

    useEffect(async () => {
        let updatedLinks = links
        while (updatedLinks.length === 0) {
            updatedLinks = await dialogRef.current.openDialog()
        }
        setLinks(updatedLinks)
    }, [])

    const filteredLinks = rxs
        .reduce(filterLinks, links)
        .map(link => h(Link, { link }))

    return [
        h("fieldset", { role: "search" },
            h("input", { type: "search", placeholder: "Search", onInput: e => setSearchText(e.target.value) }),
            h("input", { type: "button", value: "⚙", onClick: onOpenSettings })
        ),
        ...filteredLinks,
        h(SettingsDialog, { ref: dialogRef })
    ]

    async function onOpenSettings() {
        const updatedLinks = await dialogRef.current.openDialog()
        if (updatedLinks.length > 0) {
            setLinks(updatedLinks)
        }
    }
}

function filterLinks(links, rx) {
    return links.reduce((links, inLink) => {
        const link = { ...inLink }
        const match = rx.exec(link.title)
        if (match) {
            link.match = match.indices[0]
            links.push(link)
        } else if (link.links) {
            link.links = filterLinks(link.links, rx)
            if (link.links.length) {
                links.push(link)
            }
        }

        return links
    }, [])
}

function useLinks() {
    const [links, setLinks] = useState(() => {
        const cachedLinksJson = localStorage.getItem('links') || "[]"
        return JSON.parse(cachedLinksJson)
    })

    const setAndCache = useCallback(updatedLinks => {
        localStorage.setItem('links', JSON.stringify(updatedLinks))
        setLinks(updatedLinks)
    }, [links]);

    return [links, setAndCache];
}
