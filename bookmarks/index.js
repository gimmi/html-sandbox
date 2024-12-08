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
    dialogRef.current.loadContent()
    // TODO adjust / validate
    setLinks(cont)
  })

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
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    dialogEl.showModal();
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
  const [openFn, setOpenFn] = useState(_.noop);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [auth, setAuth] = useState("");
  const [path, setPath] = useState("");
  const [message, setMessage] = useState("");

  Object.assign(this, { openDialog, loadContent })

  return h('dialog', { open: openFn !== _.noop },
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
          h('input', { value: auth, onInput: e => setAuth(e.currentTarget.value) })
        )
      ),
      h('input', { type: 'button', value: 'Update', onClick: onUpdate })
    )
  )

  function openDialog() {
    return new Promise((resolve, reject) => {
      setOwner(localStorage.getItem('owner') || "")
      setRepo(localStorage.getItem('repo') || "")
      setAuth(localStorage.getItem('auth') || "")
      setPath(localStorage.getItem('path') || "")
      setOpenFn(resolve)
    })
  }

  async function loadContent() {
    const content = localStorage.getItem('content')
    if (content) {
      return content
    }

    while (!await openDialog()) {
      // keep trying
    }

    return localStorage.getItem('content')
  }

  function onCancel() {
    openFn(false)
    setOpenFn(_.noop)
  }

  async function onUpdate() {
    try {
      const content = await getContent(auth, owner, repo, path)
      localStorage.setItem('owner', owner)
      localStorage.setItem('repo', repo)
      localStorage.setItem('auth', auth)
      localStorage.setItem('path', path)
      openFn(true)
      setOpenFn(_.noop)
    } catch (error) {
      console.log(error)
      console.log("TODO set message in UI")
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

async function getContent(auth, owner, repo, path) {
  const { rest: octokit } = new Octokit({ auth })
  const { data: file } = await octokit.repos.getContent({ owner, repo, path })
  return YAML.parse(atob(file.content))
}

// authEl.value = localStorage.getItem('auth')

// loadEl.addEventListener('click', async () => {
//     const auth = authEl.value
//     localStorage.setItem('auth', auth)

//     const content = await getContent(auth)

//     contentEl.textContent = JSON.stringify(content, null, '\t');
// })
