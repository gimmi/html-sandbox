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
    const searchRegEx = new RegExp(_.escapeRegExp(searchText), "i")

    useEffect(async () => {
        let updatedLinks = links
        while (updatedLinks.length === 0) {
            updatedLinks = await dialogRef.current.openDialog()
        }
        setLinks(updatedLinks)
    }, [])

    const filteredLinks = filterLinks(links).map(link => h("li", {},
        h(Link, { link })
    ))

    return [
        h("fieldset", { role: "search" },
            h("input", { type: "search", placeholder: "Search", onInput: e => setSearchText(e.target.value) }),
            h("input", { type: "button", value: "⚙", onClick: onOpenSettings })
        ),
        h("ul", {}, filteredLinks),
        h(SettingsDialog, { ref: dialogRef })
    ]

    async function onOpenSettings() {
        const updatedLinks = await dialogRef.current.openDialog()
        if (updatedLinks.length > 0) {
            setLinks(updatedLinks)
        }
    }

    function filterLinks(inLinks) {
        return inLinks.reduce((outLinks, inLink) => {
            const outLink = { ...inLink }
            const match = searchRegEx.exec(outLink.title)
            if (match) {
                outLink.highlight = { start: match.index, length: match[0].length }
                outLinks.push(outLink)
            } else {
                outLink.links = filterLinks(inLink.links || [])
                if (outLink.links.length) {
                    outLinks.push(outLink)
                }
            }

            return outLinks
        }, [])
    }
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
