import { Octokit } from 'https://esm.sh/octokit@4.0.2'
import YAML from 'https://esm.sh/yaml@2.6.0'
import _ from "https://esm.sh/lodash@4.17.21"
import { marked } from "https://esm.sh/marked@15.0.3"

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
        .map(x => `${x.path.join("/")} [${x.file_sha}]`)
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

    async function getContent(owner, repo, file_sha) {
        const { data: blob } = await octokit.git.getBlob({ owner, repo, file_sha })
        const content = blob.encoding === 'base64' ? window.atob(blob.content) : blob.content;
        return content
    }

    async function getFiles(owner, repo, tree_sha) {
        const files = []
        await forEachFiles(owner, repo, tree_sha, async ({ owner, repo, file_sha, path }) => {
            if (path.at(-1).endsWith(".md")) {
                files.push({ path, file_sha })
            }
            if (path.at(-1) === "Docker.md") {
                const content = await getContent(owner, repo, file_sha)
                const tokens = marked.lexer(content)
                // contentEl.textContent = JSON.stringify(tokens, null, "\t")
                // contentEl.textContent += "\n----------------------------------------\n"

                const context = {
                    path,
                    headings: [...Array(10).keys().map(_ => null)]
                }
                forEachMdEl(context, tokens, (context, text, href) => {
                    contentEl.textContent += `${context.path.join('/')} - ${context.headings} - ${text} - ${href}\n`
                })
            }
        })

        return files
    }

    function forEachMdEl(context, tokens, fn) {
        for (const token of tokens) {
            if (token.type === "heading") {
                context.headings = [...context.headings.slice(0, token.depth), token.text]
            } else if (token.type === "list") {
                forEachMdEl(context, token.items, fn)
            } else if (token.type === "link") {
                fn(context, token.text, token.href)
            } else if (token.tokens) {
                forEachMdEl(context, token.tokens, fn)
            }    
        }
    }

    async function forEachFiles(owner, repo, tree_sha, fn, parentPath = []) {
        const { data: treeData } = await octokit.git.getTree({ owner, repo, tree_sha });
        for (let it of treeData.tree) {
            const path = [...parentPath, it.path]
            if (it.type === 'tree') {
                await forEachFiles(owner, repo, it.sha, fn, path)
            } else {
                await Promise.resolve(fn({ owner, repo, file_sha: it.sha, path }))
            }
        }
    }
})
