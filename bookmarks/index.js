import { Octokit } from 'https://esm.sh/octokit@4.0.2'
import YAML from 'https://esm.sh/yaml@2.6.0'

import { h, render } from 'https://esm.sh/preact@10';
import { useState, useEffect } from 'https://esm.sh/preact@10/hooks';

const appEl = document.getElementById('app')
const loadEl = document.getElementById('load')
const authEl = document.getElementById('auth')
const listEl = document.getElementById('list')
const contentEl = document.getElementById('content')

render(h(App), document.getElementById('app'));

function App() {
  const [auth, setAuth] = useState(localStorage.getItem('auth'));
  const [content, setContent] = useState({});

  useEffect(async () => {
    const cont = await getContent(auth)
    setContent(cont)
  }, [auth])

  return [
    h('fieldset', { role: 'search' }, 
        h('input', { type: "search", placeholder: "Search" }),
        h('button', { type: "button"}, "Search")
    ),
    h('pre', null, JSON.stringify(content, null, '\t'))
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
