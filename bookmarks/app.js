import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import _ from 'lodash';
import SettingsDialog from "./settings-dialog.js"
import Link from "./link.js"

export default function App() {
    const [searchText, setSearchText] = useState("");
    const [links, setLinks] = useState([]);
    const dialogRef = useRef(null);

    // TODO replace with https://github.com/farzher/fuzzysort
    const searchRegEx = new RegExp(searchText, "i")

    useEffect(async () => {
        let content = null
        while (true) {
            content = JSON.parse(localStorage.getItem('content') || "null")
            if (content) {
                break
            }

            content = await openDialog()
            if (content) {
                localStorage.setItem('content', JSON.stringify(content))
                break
            }
        }

        setLinks(content)
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

    function onOpenSettings() {
        dialogRef.current.openDialog()
    }

    function filterLinks(inLinks) {
        return inLinks.reduce((outLinks, inLink) => {
            const outLink = {
                ...inLink,
                links: filterLinks(inLink.links || [])
            }

            if (outLink.links.length || searchRegEx.test(outLink.title)) {
                outLinks.push(outLink)
            }

            return outLinks
        }, [])
    }
}
