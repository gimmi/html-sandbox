import { Octokit } from 'https://esm.sh/octokit@4.0.2'
import YAML from 'https://esm.sh/yaml@2.6.0'

const loadEl = document.getElementById('load')
const authEl = document.getElementById('auth')
const listEl = document.getElementById('list')
const contentEl = document.getElementById('content')

authEl.value = localStorage.getItem('auth')

loadEl.addEventListener('click', async () => {
    const auth = authEl.value
    const { rest: octokit } = new Octokit({ auth })

    localStorage.setItem('auth', auth)

    const { data: repo } = await octokit.repos.get({
        owner: 'gimmi',
        repo: 'brain'
    })

    const { data: file } = await octokit.repos.getContent({
        owner: repo.owner.login,
        repo: repo.name,
        path: '/Bookmarks.yaml'
    })
    
    const content = YAML.parse(atob(file.content))

    console.dir(content)

    // Inspired by https://gist.github.com/testcollab/1236348
    const { data: ref } = await octokit.git.getRef({
        owner: repo.owner.login,
        repo: repo.name,
        ref: `heads/${repo.default_branch}`
    });

    const { data: tree } = await octokit.git.getTree({
        owner: repo.owner.login,
        repo: repo.name,
        tree_sha: ref.object.sha
    });

    for (let it of tree.tree) {
        listEl.textContent += `${it.path}${it.type === 'tree' ? '/' : ''} [${it.sha}]\n`

        if (it.path === 'Docker.md') {
            const { data: blob } = await octokit.git.getBlob({
                owner: repo.owner.login,
                repo: repo.name,
                file_sha: it.sha
            })

            const content = blob.encoding === 'base64' ? window.atob(blob.content) : blob.content;
            contentEl.textContent = content;
        }
    }

})
