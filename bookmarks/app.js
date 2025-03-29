import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import _ from 'lodash';
import SettingsDialog from "./settings-dialog.js"
import Link from "./link.js"

export default function App() {
    const [searchText, setSearchText] = useState("");
    const [links, setLinks] = usePersistentState("links", []);
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

    const style = {
        flexGrow: 1,
        overflow: "auto",
        display: "inline-flex",
        flexWrap: "wrap",
        // flexWrap: "nowrap",
        flexDirection: "column",
        columnGap: "var(--pico-spacing)",
        alignContent: "flex-start",
        paddingLeft: "var(--pico-spacing)"
    }

    return [
        h("fieldset", { role: "search", style: "margin: 0; padding: var(--pico-spacing);" },
            h("input", { type: "search", placeholder: "Search", onInput: e => setSearchText(e.target.value), autofocus: true }),
            h("input", { type: "button", value: "⚙", onClick: onOpenSettings, tabindex: "-1" })
        ),
        h("div", { style: style },
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

function usePersistentState(key, def) {
    const [state, setState] = useState(() => {
        const item = localStorage.getItem(key)
        if (item) {
            return JSON.parse(item)
        }

        return def
    })

    const cacheAndSetState = useCallback(val => {
        localStorage.setItem(key, JSON.stringify(val))
        setState(val)
    }, [state]);

    return [state, cacheAndSetState];
}
