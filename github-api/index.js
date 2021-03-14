import { Octokit } from 'https://cdn.skypack.dev/@octokit/rest'

const loadEl = document.getElementById('load')
const authEl = document.getElementById('auth')
const outputEl = document.getElementById('output')

authEl.value = localStorage.getItem('auth')

loadEl.addEventListener('click', async () => {
    const auth = authEl.value
    const octokit = new Octokit({ auth })

    localStorage.setItem('auth', auth)

    const { data: repo } = await octokit.request('/repos/gimmi/brain')

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
        outputEl.textContent += it.path
        if (it.type === 'tree') {
            outputEl.textContent += '/'
        }
        outputEl.textContent += '\n'
    }
})
