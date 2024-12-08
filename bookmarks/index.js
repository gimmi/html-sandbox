import { Octokit } from 'https://esm.sh/octokit@4.0.2'
import YAML from 'https://esm.sh/yaml@2.6.0'

import { h, render } from 'https://esm.sh/preact@10';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10/hooks';
import _ from 'https://esm.sh/lodash@4.17.21';

render(h(App), document.getElementById('app'));

function App() {
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

function SettingsDialog() {
  const [promiseCallbacks, setPromiseCallbacks] = useState(null);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [auth, setAuth] = useState("");
  const [path, setPath] = useState("");

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
          h('input', { value: path, onInput: e => setPath(e.currentTarget.value) })
        ),
        h('label', {},
          'Auth',
          h('input', { value: auth, onInput: e => setAuth(e.currentTarget.value) }),
          h('small', {}, "Generate a new token ", h('a', { href: "https://github.com/settings/tokens"}, "HERE"))
        )
      ),
      h('input', { type: 'button', value: 'Update', onClick: onUpdate })
    )
  )

  function openDialog() {
    if (promiseCallbacks) throw new Error("Dialog already opened")

    return new Promise((resolve, reject) => {
      setOwner(localStorage.getItem('owner') || "")
      setRepo(localStorage.getItem('repo') || "")
      setAuth(localStorage.getItem('auth') || "")
      setPath(localStorage.getItem('path') || "")
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
      const content = YAML.parse(atob(file.content))
      localStorage.setItem('owner', owner)
      localStorage.setItem('repo', repo)
      localStorage.setItem('auth', auth)
      localStorage.setItem('path', path)
      promiseCallbacks.resolve(content)
      setPromiseCallbacks(null)
    } catch (error) {
      // TODO set message in UI
      console.log(error)
    }
  }
}

function Link({ link }) {
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
