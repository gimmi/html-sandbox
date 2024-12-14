import { Octokit } from 'https://esm.sh/octokit@4.0.2'
import YAML from 'https://esm.sh/yaml@2.6.0'

const loadEl = document.getElementById('load')
const authEl = document.getElementById('auth')
const listEl = document.getElementById('list')
const contentEl = document.getElementById('content')

authEl.value = localStorage.getItem('auth')

loadEl.addEventListener('click', async () => {
    const auth = authEl.value
    const owner = "gimmi"
    const repo = "brain"
    const { rest: octokit } = new Octokit({ auth })

    localStorage.setItem('auth', auth)

    const { data: repoData } = await octokit.repos.get({ owner, repo })

    // Inspired by https://gist.github.com/testcollab/1236348
    const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${repoData.default_branch}`
    });

    const { data: treeData } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: refData.object.sha
    });

    const files = await getFiles(owner, repo, refData.object.sha)
    listEl.textContent = files
        .map(x => `${x.path.join("/")} [${x.sha}]`)
        .join("\n")

    // for (let it of treeData.tree) {
    //     listEl.textContent += `${it.path}${it.type === 'tree' ? '/' : ''} [${it.sha}]\n`

    //     if (it.path === 'Docker.md') {
    //         const { data: blob } = await octokit.git.getBlob({
    //             owner: repoData.owner.login,
    //             repo: repoData.name,
    //             file_sha: it.sha
    //         })

    //         const content = blob.encoding === 'base64' ? window.atob(blob.content) : blob.content;
    //         contentEl.textContent = content;
    //     }
    // }

    async function getFiles(owner, repo, tree_sha, parentPath = []) {
        const files = []
        const { data: treeData } = await octokit.git.getTree({ owner, repo, tree_sha });
        for (let it of treeData.tree) {
            const path = [...parentPath, it.path]
            if (it.type === 'tree') {
                const childFiles = await getFiles(owner, repo, it.sha, path)
                files.push(...childFiles)
            } else {
                files.push({ path, sha: it.sha })
            }
        }

        return files
    }
})
