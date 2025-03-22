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
    const searchTerms = searchText
        .toLowerCase()
        .split(" ")
        .filter(Boolean)

    useEffect(async () => {
        let updatedLinks = links
        while (updatedLinks.length === 0) {
            updatedLinks = await dialogRef.current.openDialog()
        }
        setLinks(updatedLinks)
    }, [])

    const filteredLinks = searchTerms.length ? 
        searchTerms.reduce(reduceLinks, links) :
        links

    return [
        h("fieldset", { role: "search" },
            h("input", { type: "search", placeholder: "Search", onInput: e => setSearchText(e.target.value), autofocus: true }),
            h("input", { type: "button", value: "⚙", onClick: onOpenSettings, tabindex: "-1" })
        ),
        h("div", { style: "flex-grow: 1; overflow: hidden; display: inline-flex; flex-wrap: wrap; flex-direction: column; column-gap: var(--pico-spacing); align-content: flex-start;" },
            filteredLinks.map(link => h(Link, { link }))
        ),
        h(SettingsDialog, { ref: dialogRef })
    ]

    async function onOpenSettings() {
        const updatedLinks = await dialogRef.current.openDialog()
        if (updatedLinks.length > 0) {
            setLinks(updatedLinks)
        }
    }
}

function reduceLinks(links, rx) {
    return links.reduce((links, inLink) => {
        const link = { ...inLink }
        const index = link.title.toLowerCase().indexOf(rx)
        if (index !== -1) {
            link.match = [index, index + rx.length]
            links.push(link)
        } else if (link.links) {
            link.links = reduceLinks(link.links, rx)
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
