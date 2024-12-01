import { Octokit } from 'https://esm.sh/octokit@4.0.2'
import YAML from 'https://esm.sh/yaml@2.6.0'

import { h, render } from 'https://esm.sh/preact@10';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10/hooks';
import _ from 'https://esm.sh/lodash@4.17.21';

const appEl = document.getElementById('app')
const loadEl = document.getElementById('load')
const authEl = document.getElementById('auth')
const listEl = document.getElementById('list')
const contentEl = document.getElementById('content')

render(h(App), document.getElementById('app'));

function App() {
  const [auth, setAuth] = useState(localStorage.getItem('auth'));
  const [searchText, setSearchText] = useState("");
  const [links, setLinks] = useState([]);
  const dialogRef = useRef(null);

  // TODO replace with https://github.com/farzher/fuzzysort
  const searchRegEx = new RegExp(searchText, "i")

  useEffect(async () => {
    // TODO check missing auth
    const cont = await getContent(auth)
    // TODO adjust / validate
    setLinks(cont)
  }, [auth])

  const filteredLinks = filterLinks(links).map(link => h("li", {},
    h(Link, { link })
  ))

  return [
    h("fieldset", { role: "search" },
      h("input", { type: "search", placeholder: "Search", onInput: e => setSearchText(e.target.value) }),
      h("input", { type: "button", value: "⚙", onClick: onOpenSettings })
    ),
    h("ul", {}, filteredLinks),
    h('dialog', { ref: dialogRef, open: false },
      h('article', {},
        h('header', {},
          h('button', { rel: 'prev' }),
          h('p', {}, h('strong', {}, 'Settings'))
        ),
        h('p', {}, 'TODO')
      )
    )
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

async function getContent(auth) {
  const { rest: octokit } = new Octokit({ auth })

  const { data: repo } = await octokit.repos.get({
    owner: 'gimmi',
    repo: 'brain'
  })

  const { data: file } = await octokit.repos.getContent({
    owner: repo.owner.login,
    repo: repo.name,
    path: '/Bookmarks.yaml'
  })

  return YAML.parse(atob(file.content))
}

// authEl.value = localStorage.getItem('auth')

// loadEl.addEventListener('click', async () => {
//     const auth = authEl.value
//     localStorage.setItem('auth', auth)

//     const content = await getContent(auth)

//     contentEl.textContent = JSON.stringify(content, null, '\t');
// })
