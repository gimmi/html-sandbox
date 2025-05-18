import { Octokit } from 'octokit'
import YAML from 'yaml'

import { h } from 'preact';
import { useState } from 'preact/hooks';
import _ from 'lodash';

export default function SettingsDialog() {
    const [promiseCallbacks, setPromiseCallbacks] = useState(null);
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [auth, setAuth] = useState("");
    const [path, setPath] = useState("");
    const [flexWrap, setFlexWrap] = useState("nowrap");

    Object.assign(this, { openDialog })

    return h('dialog', { open: !!promiseCallbacks },
        h('article', {},
            h('header', {},
                h('button', { rel: 'prev', onClick: onCancel }),
                h('p', {}, h('strong', {}, 'Settings'))
            ),
            h('form', {},
                h('fieldset', { class: 'grid' },
                    h('label', {},
                        'Owner',
                        h('input', { value: owner, onInput: e => setOwner(e.currentTarget.value) })
                    ),
                    h('label', {},
                        'Repo',
                        h('input', { value: repo, onInput: e => setRepo(e.currentTarget.value) })
                    )
                ),
                h('label', {},
                    'Path',
                    h('input', { value: path, onInput: e => setPath(e.currentTarget.value) }),
                    h('small', {}, "Edit ", h('a', { href: `https://github.com/${owner}/${repo}/edit/main/${path}` }, "HERE"))
                ),
                h('label', {},
                    'Auth',
                    h('input', { value: auth, onInput: e => setAuth(e.currentTarget.value) }),
                    h('small', {}, "Generate a new token ", h('a', { href: "https://github.com/settings/tokens" }, "HERE"))
                ),
                h('select', { value: flexWrap, onInput: e => setFlexWrap(e.currentTarget.value) },
                    h('option', { value: "wrap" }, 'Flow horizontally 🢂'),
                    h('option', { value: "nowrap" }, 'Flow vertically 🢃')
                )
            ),
            h('input', { type: 'button', value: 'Update', onClick: onUpdate })
        )
    )

    function openDialog({ flexWrap }) {
        if (promiseCallbacks) throw new Error("Dialog already opened")

        return new Promise((resolve, reject) => {
            setOwner(localStorage.getItem('owner') || "")
            setRepo(localStorage.getItem('repo') || "")
            setAuth(localStorage.getItem('auth') || "")
            setPath(localStorage.getItem('path') || "")
            setFlexWrap(flexWrap)
            setPromiseCallbacks({ resolve, reject })
        })
    }

    function onCancel() {
        promiseCallbacks.resolve(null)
        setPromiseCallbacks(null)
    }

    async function onUpdate() {
        try {
            const { rest: octokit } = new Octokit({ auth })
            const { data: file } = await octokit.repos.getContent({ owner, repo, path })
            const yaml = YAML.parse(decodeBase64(file.content))
            const contexts = _.isArray(yaml) ? { "*": yaml } : yaml
            const context = Object.keys(contexts)[0]
            localStorage.setItem('owner', owner)
            localStorage.setItem('repo', repo)
            localStorage.setItem('auth', auth)
            localStorage.setItem('path', path)
            promiseCallbacks.resolve({ contexts, context, flexWrap })
            setPromiseCallbacks(null)
        } catch (error) {
            // TODO set message in UI
            console.log(error)
        }
    }

    // https://stackoverflow.com/a/64752311/66629
    function decodeBase64(base64) {
        const text = atob(base64);
        const bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            bytes[i] = text.charCodeAt(i);
        }
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(bytes);
    }
}
