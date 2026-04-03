import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Sun, Moon, Languages, GitBranch, X } from 'lucide-react'

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: '.gitignore Generator',
    subtitle: 'Select and combine .gitignore templates for your stack. Preview the result and copy. Client-side only.',
    templates: 'Templates',
    templatesDesc: 'Click to select one or more templates',
    selected: 'Selected',
    none: 'None selected',
    preview: 'Preview',
    previewDesc: 'Combined .gitignore content',
    copy: 'Copy', copied: 'Copied!',
    clearAll: 'Clear All',
    builtBy: 'Built by',
    search: 'Search templates...',
    categories: { languages: 'Languages', tools: 'Tools', editors: 'Editors', os: 'Operating Systems' },
  },
  pt: {
    title: 'Gerador de .gitignore',
    subtitle: 'Selecione e combine templates .gitignore para sua stack. Visualize e copie o resultado. Tudo no navegador.',
    templates: 'Templates',
    templatesDesc: 'Clique para selecionar um ou mais templates',
    selected: 'Selecionados',
    none: 'Nenhum selecionado',
    preview: 'Visualizacao',
    previewDesc: 'Conteudo .gitignore combinado',
    copy: 'Copiar', copied: 'Copiado!',
    clearAll: 'Limpar',
    builtBy: 'Criado por',
    search: 'Buscar templates...',
    categories: { languages: 'Linguagens', tools: 'Ferramentas', editors: 'Editores', os: 'Sistemas Operacionais' },
  },
} as const

type Lang = keyof typeof translations

// ── Template data ─────────────────────────────────────────────────────────────
type Category = 'languages' | 'tools' | 'editors' | 'os'

interface Template {
  id: string
  label: string
  category: Category
  content: string
}

const TEMPLATES: Template[] = [
  {
    id: 'nodejs', label: 'Node.js', category: 'languages',
    content: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-store/
.npm
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
dist/
build/
.cache/
*.tsbuildinfo
.env
.env.local
.env.*.local
coverage/`,
  },
  {
    id: 'python', label: 'Python', category: 'languages',
    content: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
dist/
develop-eggs/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.dmypy.json
dmypy.json
*.pyo`,
  },
  {
    id: 'go', label: 'Go', category: 'languages',
    content: `# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/
go.sum
# Build output
bin/
dist/`,
  },
  {
    id: 'java', label: 'Java', category: 'languages',
    content: `# Java
*.class
*.log
*.ctxt
.mtj.tmp/
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar
hs_err_pid*
target/
.gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/
.idea/
*.iml`,
  },
  {
    id: 'rust', label: 'Rust', category: 'languages',
    content: `# Rust
debug/
target/
Cargo.lock
**/*.rs.bk
*.pdb`,
  },
  {
    id: 'ruby', label: 'Ruby', category: 'languages',
    content: `# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/
.byebug_history
.dat*
.repl_history
*.bridgesupport
build-iPhoneOS/
build-iPhoneSimulator/
/.bundle/
/vendor/bundle
/lib/bundler/man/
.rvmrc`,
  },
  {
    id: 'dotnet', label: '.NET / C#', category: 'languages',
    content: `# .NET
*.user
*.userosscache
*.sln.docstates
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Ww][Ii][Nn]32/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/
.vs/
*.pidb
*.svclog
*.scc
_ReSharper*/
*.[Rr]e[Ss]harper
*.DotSettings.user
*.ncrunchproject
packages/
!packages/build/
*.nupkg
*.snupkg`,
  },
  {
    id: 'terraform', label: 'Terraform', category: 'tools',
    content: `# Terraform / OpenTofu
.terraform/
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
*.tfvars.json
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraformrc
terraform.rc
.terraform.lock.hcl`,
  },
  {
    id: 'docker', label: 'Docker', category: 'tools',
    content: `# Docker
.dockerignore
docker-compose.override.yml
.env
.env.*`,
  },
  {
    id: 'helm', label: 'Helm', category: 'tools',
    content: `# Helm
charts/*.tgz
.helm/`,
  },
  {
    id: 'vscode', label: 'VS Code', category: 'editors',
    content: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/*.code-snippets
.history/
*.vsix`,
  },
  {
    id: 'jetbrains', label: 'JetBrains', category: 'editors',
    content: `# JetBrains
.idea/
*.iml
*.iws
*.ipr
out/
!**/src/main/**/out/
!**/src/test/**/out/`,
  },
  {
    id: 'vim', label: 'Vim', category: 'editors',
    content: `# Vim
[._]*.s[a-v][a-z]
!*.svg
[._]*.sw[a-p]
[._]s[a-rt-v][a-z]
[._]ss[a-gi-z]
[._]sw[a-p]
Session.vim
Sessionx.vim
.netrwhist
*~
tags
[._]*.un~`,
  },
  {
    id: 'macos', label: 'macOS', category: 'os',
    content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk`,
  },
  {
    id: 'windows', label: 'Windows', category: 'os',
    content: `# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk`,
  },
  {
    id: 'linux', label: 'Linux', category: 'os',
    content: `# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*`,
  },
]

const CATEGORIES: Category[] = ['languages', 'tools', 'editors', 'os']

// ── Component ─────────────────────────────────────────────────────────────────
export default function GitignoreGenerator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  const t = translations[lang]

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const toggle = (id: string) => setSelected(s => {
    const n = new Set(s)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  const output = TEMPLATES
    .filter(tp => selected.has(tp.id))
    .map(tp => tp.content.trim())
    .join('\n\n')

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }, [output])

  const filteredTemplates = (cat: Category) =>
    TEMPLATES.filter(tp => tp.category === cat && tp.label.toLowerCase().includes(search.toLowerCase()))

  const selectedList = TEMPLATES.filter(tp => selected.has(tp.id))

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <GitBranch size={18} className="text-white" />
            </div>
            <span className="font-semibold">.gitignore Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/gitignore-generator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Templates panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{t.templates}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.templatesDesc}</p>
                </div>
                {selected.size > 0 && (
                  <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors">
                    <X size={12} />{t.clearAll}
                  </button>
                )}
              </div>

              {/* Search */}
              <input
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              {/* Selected chips */}
              {selectedList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedList.map(tp => (
                    <span key={tp.id} className="flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs px-3 py-1">
                      {tp.label}
                      <button onClick={() => toggle(tp.id)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}

              {/* Category groups */}
              {CATEGORIES.map(cat => {
                const items = filteredTemplates(cat)
                if (items.length === 0) return null
                return (
                  <div key={cat} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t.categories[cat]}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(tp => (
                        <button
                          key={tp.id}
                          onClick={() => toggle(tp.id)}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${selected.has(tp.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-400'}`}
                        >
                          {tp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="font-semibold text-sm">{t.preview}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.previewDesc}</p>
                </div>
                <button onClick={handleCopy} disabled={!output} className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40">
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre min-h-[300px]">
                {output || <span className="text-zinc-400 italic">Select templates to preview the .gitignore content...</span>}
              </pre>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
