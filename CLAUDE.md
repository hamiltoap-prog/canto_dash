# Gestão Musical — Reconstrução como Web App (GitHub, multi-tenant)

> Brief do projeto. Mantenha este arquivo atualizado conforme o escopo evolui
> — é a fonte de verdade entre sessões de desenvolvimento.

## Resumo em uma frase

Dashboard web para gestão de grupos musicais (corais) — repertório com
partituras/áudios por naipe, aulas recorrentes, calendário de eventos e
painel administrativo — com **login de verdade** e cada usuário vendo
apenas os grupos aos quais pertence.

## Restrição permanente: custo zero

O projeto não pode gerar custos recorrentes. Toda decisão técnica (stack,
bibliotecas, serviços) deve caber nos free tiers: Supabase free tier,
Vercel/Netlify free, GitHub free. Bibliotecas client-side (react-pdf,
zustand etc.) são sempre aceitáveis — são só código, não geram custo de
infraestrutura.

## Contexto

Este projeto já existiu como protótipo funcional rodando em Google Apps
Script + Google Sheets, construído em 5 fases (repertório, calendário,
aulas, painel admin). Esse protótipo foi abandonado — não pelo design ou
pelas regras de negócio, que funcionavam bem e foram validadas com uso
real, mas pela plataforma: o editor web do Apps Script corrompia
sistematicamente o código colado, tornando o deploy pouco confiável.

O modelo de domínio, as regras de negócio e as lições de UX abaixo foram
testadas e funcionam — não são hipóteses.

## Quem usa e como acessa

- **Membro do grupo**: cria conta, é adicionado a um ou mais grupos por um
  admin, faz login e enxerga apenas os dados dos grupos aos quais pertence.
- **Administrador de grupo**: mesmas telas de um membro, mais um painel de
  CRUD completo — mas só sobre os grupos onde tem papel de admin.
- **Sem grupo**: usuário logado que ainda não foi adicionado a nenhum
  grupo vê uma tela de espera/instrução, não uma tela vazia ou quebrada.

O controle de acesso por grupo é o núcleo do produto — cada tela e cada
query precisa respeitar isso, não só a interface.

## Módulos funcionais

### 1. Autenticação
- Cadastro e login (e-mail/senha; magic link é bônus, não obrigatório)
- Recuperação de senha
- Após login, o usuário só vê os grupos dos quais é membro
- Convite de novo membro para um grupo é ação do admin, não cadastro livre

### 2. Cabeçalho e navegação
- Nome do grupo ativo + seletor (populado só com os grupos do usuário)
- Alternância de tema claro/escuro, com preferência persistida
- Filtro por naipe: Geral / Soprano / Contralto / Tenor / Baixo / Solo —
  **ao selecionar um naipe, a interface ganha uma tematização de cor sutil
  específica daquele naipe** (borda, badge, destaques — não uma repintura
  agressiva da tela toda). Tokens em `src/styles/index.css`
  (`--color-naipe-*`) aplicados via `data-naipe` em `src/lib/naipe.ts`.
- Navegação por abas: Repertório / Aulas / Agenda

### 3. Projetos e repertório
- Cards de projeto: nome, data, local, status (Planejado/Em andamento/
  Concluído/Cancelado)
- Busca por nome de música (ignorando acentos, ver `src/lib/text.ts`) e
  filtro por tipo de arquivo (Partituras / Guias / Tudo)
- Matriz de disponibilidade: para cada música, quais naipes têm partitura
  e guia de áudio cadastrados (e quais faltam)
- Visualizador embutido de PDF (react-pdf) e player de áudio com controle
  de velocidade (0.75× / 1× / 1.25×)
- Informações extras do projeto: descrição, endereço com link de mapa,
  galeria de figurino com lightbox, paleta de cores com "copiar hex"

#### 3a. Loop A/B + velocidade reduzida no player de áudio (melhoria)
Objetivo: marcar um trecho da música (ponto A e ponto B) e ouvir só aquele
trecho em loop, combinando com velocidade reduzida — uso de treino de
naipe. Tudo client-side, sem custo:
- `audio.currentTime` para definir A e B (usuário toca "marcar A" / "marcar
  B" durante a reprodução, ou digita o tempo manualmente)
- Listener em `timeupdate`: ao atingir o ponto B, volta para o ponto A
  automaticamente (loop)
- `audio.playbackRate` para velocidade (mesmo mecanismo do controle
  0.75×/1×/1.25× já previsto) — pitch muda junto por ser nativo do
  browser; se isso incomodar no uso real, dá pra trocar por uma lib de
  time-stretch tipo `soundtouchjs` (MIT, gratuita) numa iteração futura
- Marcadores salvos por usuário + música + naipe em `audio_loop_markers`
  (schema em `supabase/migrations/0001_init.sql`), para retomar o treino
  depois — RLS garante que cada um só vê e edita os próprios marcadores
- Camada de API já existe em `src/api/loopMarkers.ts`; falta a UI do
  player em si (parte da tela de Repertório, ainda não construída)

#### 3b. Anotações em PDF (melhoria)
Objetivo: anotar PDFs de letra ou partitura. Anotação de admin marcada como
pública é vista por todo o grupo; anotação de membro comum é sempre
privada (só quem escreveu vê).
- Renderização com `react-pdf` (pdf.js, MIT) + camada de overlay
  posicionada por coordenadas normalizadas (x, y, página) sobre o canvas
  do PDF
- Tabela `pdf_annotations` (schema em `supabase/migrations/0001_init.sql`)
  com `visibility: 'public' | 'private'`; RLS impede que um membro comum
  grave `visibility='public'` (só admin pode) e impede leitura de
  anotação privada alheia
- Camada de API já existe em `src/api/annotations.ts`; falta a UI de
  overlay + formulário de anotação sobre o visualizador de PDF

### 4. Aulas recorrentes
- Lista de aulas por data, com materiais de estudo anexados (PDF, áudio,
  imagem ou link externo — cada um abre da forma apropriada)

### 5. Calendário
- Grade mensal com navegação entre meses (não uma lista simples)
- Cor por tipo de evento: Aula / Ensaio / Apresentação / Outro
- Clique num dia com evento mostra os eventos daquele dia
- Detalhe do evento com botão "Adicionar ao Google Agenda" (deep link, sem
  OAuth)

### 6. Painel administrativo
- CRUD completo: Grupos, Membros, Projetos, Repertório, Aulas, Eventos
- Confirmação antes de excluir, avisando sobre vínculos
- Upload de arquivo direto (figurino, partitura, áudio) via Supabase
  Storage — bucket único `group-files`, path `{group_id}/...` (ver
  `supabase/migrations/0002_storage.sql`)

## Modelo de dados

Ver `supabase/migrations/0001_init.sql` para o schema completo e
comentado. Tabelas principais: `groups`, `group_members`, `projects`,
`songs`, `recurring_classes`, `class_materials`, `calendar_events`, mais
as duas tabelas das melhorias: `audio_loop_markers`, `pdf_annotations`.
`auth.users` vem pronto do Supabase Auth — nunca recriar essa tabela.

## Controle de acesso

Row Level Security por `group_id`, usando `group_members` como fonte de
verdade — nunca confiar em checagem feita só no front-end. Toda query de
leitura e escrita passa pelo filtro de grupo no nível do banco. Funções
helper `is_group_member()` / `is_group_admin()` (security definer)
centralizam essa checagem dentro das policies — ver o SQL para o padrão
antes de criar uma tabela nova.

## Arquitetura

- **Frontend**: React 19 + Vite + TypeScript, SPA mobile-first, Tailwind
  CSS v4 para os design tokens
- **Backend / banco / auth / storage**: Supabase (free tier)
- **Deploy**: GitHub → Vercel ou Netlify (deploy automático a cada push,
  configs prontas em `vercel.json` e `netlify.toml`)
- **Estado**: um único store central (Zustand, `src/store/useAppStore.ts`)
  com slices de auth / membership / ui — as views só leem do estado, a
  lógica de negócio não fica espalhada em handlers de clique
- **Camada de API isolada**: `src/api/*.ts` — todo acesso ao Supabase
  passa por ali, nunca direto de dentro de um componente

## Padrões e lições a preservar

- **Design mobile-first**, inspirado no Apple HIG: tokens de cor/raio/
  espaçamento centralizados (`src/styles/index.css`), dark mode com
  preferência persistida, fonte Inter, ícones Lucide
- **Nunca usar innerHTML sem escapar** — React já escapa por padrão; não
  introduzir `dangerouslySetInnerHTML` com texto vindo do banco
- **Datas sempre com fuso horário tratado** — usar `src/lib/date.ts`
  (`parseLocalDate`/`formatLocalDate`), nunca `new Date('YYYY-MM-DD')`
  direto (bug de "dia anterior" na versão anterior)
- **Nenhum estado assíncrono trava "carregando" sem explicação** — usar os
  componentes de `src/components/ui/AsyncState.tsx`
  (`LoadingState`/`ErrorState`/`EmptyState`) em todo fetch
- **Testes automatizados desde o início** (Vitest) — a versão anterior
  chegou a 226 testes cobrindo utilitários, filtros e regras de negócio
- **Confirmação antes de qualquer exclusão**, avisando sobre dependências

## Fora do escopo desta primeira etapa

- Login social (Google/Apple)
- Integração OAuth real com Google Agenda (deep link já resolve)
- App nativo — só web responsiva

## Direção de design (importante — não regredir)

O usuário pediu explicitamente um visual **moderno, sério, inspirado no
design da Apple**. Isso significa, na prática:
- Cores por naipe são **desaturadas/discretas** (`--color-naipe-*` em
  `src/styles/index.css`), nunca tons "candy"/saturados — o objetivo é um
  acento sutil, não uma repintura colorida. Se for ajustar a paleta,
  manter esse grau de sobriedade.
- Chips de filtro (naipe, tipo de arquivo, status) usam contorno fino +
  fundo `-soft` + texto na cor de acento — não preenchimento sólido
  vibrante com texto branco (ver `Header.tsx` naipe pills e
  `SongList.tsx` para o padrão a seguir em novos filtros).
- Superfícies neutras em tons de cinza grafite (`--color-surface-*`),
  cards com sombra suave (`--shadow-card`/`--shadow-raised`) para dar
  elevação sem exagero.
- **Pouco arredondado**: `--radius-card` (14px) e `--radius-control`/
  `--radius-chip` (8px) são deliberadamente contidos — cantos arredondados
  existem, mas nada de formato "pílula"/bolha em chips, badges ou botões
  de filtro (evitar `rounded-full` fora de controles genuinamente
  circulares como o botão de play ou o toggle de tema).
- **"Atmosfera de palco"** nos momentos de identidade/abertura — tela de
  login/cadastro e o cabeçalho de cada projeto (que é, no fim, uma
  apresentação/show): fundo quase preto com um glow radial sutil
  (`--color-stage-surface` + `--stage-glow` em `src/styles/index.css`),
  card com leve blur, texto claro. A classe utilitária `.stage-scope`
  reescopa os tokens de trabalho (`--color-surface`, `--color-text`,
  `--color-border`, `--color-accent` etc.) para essa paleta escura fixa
  dentro do elemento — assim qualquer componente comum (`TextField`,
  `Button`, `StatusBadge`...) continua legível ali sem precisar de uma
  variante própria. Esse tratamento é deliberadamente **fixo** (não segue
  o toggle claro/escuro do usuário) — é um momento de marca, não uma
  superfície de trabalho. Usar com moderação: só nesses dois lugares, não
  espalhar pela interface toda (listas e telas de dados continuam claras/
  neutras para manter legibilidade).
  - Dentro do `.stage-scope`, `--color-accent` é um dourado envelhecido
    discreto (`#9c7f4c`), não o azul de trabalho do resto do app — ele
    precisa combinar com o glow quente, não competir com ele. O texto/
    ícone sobre esse acento usa `--color-accent-contrast` (também
    reescopado, ver `Button.tsx` variante `primary`) em vez de branco
    fixo, porque um acento mais claro pode precisar de texto escuro.
- **Header e nav inferior fixos com leve desfoque** (`sticky` +
  `backdrop-blur-lg` + fundo translúcido) — efeito "vidro fosco" ao
  rolar a página, look mais premium que uma barra opaca comum.
- **Títulos de página confiantes**: `components/layout/PageTitle.tsx`
  (26px, tracking apertado) no topo de cada tela do dashboard — antes as
  telas internas não tinham hierarquia tipográfica nenhuma, o que
  contribuía pra sensação de "sem graça" apontada pelo usuário.

## Estado atual do desenvolvimento

**Concluído:**
1. Setup do repositório (Vite + React + TS + Tailwind), lint, testes
2. Schema do banco completo com RLS (`supabase/migrations/`), incluindo
   `audio_loop_markers` e `pdf_annotations`
3. Autenticação (cadastro, login, recuperação de senha) e seleção de grupo
4. Shell do dashboard: header com seletor de grupo, tema claro/escuro,
   filtro de naipe tematizado, navegação por abas, tela de "sem grupo"
5. Tela de Repertório: lista de projetos (busca, status), detalhe do
   projeto (descrição, endereço com link de mapa, galeria de figurino com
   lightbox, paleta de cores com "copiar hex"), matriz de disponibilidade
   por naipe, lista de músicas (busca + filtro Partituras/Guias/Tudo)
6. Visualizador de PDF (`react-pdf`) com anotações por coordenada
   normalizada — pública (admin) vs. privada (membro) — 3b do brief
7. Player de áudio com velocidade (0.75×/1×/1.25×), marcadores A/B de
   loop e persistência por usuário/música/naipe — 3a do brief
8. `profiles` (espelho de `auth.users`) + RPCs `create_group_with_admin` e
   `invite_member` (`supabase/migrations/0003_profiles_and_invites.sql`)
   — resolvem o "ovo e a galinha" de criar o primeiro grupo/admin e
   permitem convidar membro existente pelo e-mail sem expor `auth.users`
   ao cliente
9. Painel Administrativo (`/admin`, carregado sob demanda, só visível
   para admin do grupo ativo): editar dados do grupo; Membros (convidar
   por e-mail, promover/rebaixar admin, remover, com confirmação);
   Projetos — CRUD completo (paleta de cores, upload de fotos de
   figurino) e, dentro de cada projeto, CRUD de músicas com upload de
   partitura/áudio-guia por naipe direto pro bucket `group-files`
10. "Criar meu grupo" na tela de quem ainda não tem grupo — usa a RPC
    acima, então dá pra sair do zero sem precisar do Table Editor do
    Supabase
11. Multi-grupo: botão "+" ao lado do seletor de grupo no header abre o
    mesmo fluxo de criação a qualquer momento (não só quando o usuário
    está sem nenhum grupo) — `CreateGroupModal.tsx`, reusado pelo
    `NoGroupPage`. Membros/Projetos/Músicas no Admin já eram escopados
    por `activeGroupId`, então múltiplos grupos (ex.: "Coral X", "Coral
    Y") já funcionam de forma independente — só faltava o jeito de criar
    o segundo grupo pela UI
12. Faixa de "Playback" (instrumental/backing track) no áudio-guia —
    além dos naipes e "Geral", uma música pode ter uma faixa de playback
    avulsa (`NaipeFileMap.playback`), com upload no Admin e um chip
    dedicado no seletor de áudio do player (não se aplica a partitura)
13. Alternativa a upload direto: colar link externo (Dropbox, Google
    Drive) em qualquer slot de partitura/áudio do Admin — o Supabase
    Storage free tier tem limite de tamanho por arquivo (~50MB, mensagem
    "The object exceeded the maximum allowed size"), e áudio-guia estoura
    isso fácil. `src/lib/externalLink.ts` normaliza o link (Dropbox
    `dl=0`→`dl=1`, Drive "view"→download direto) antes de salvar — a
    partir daí é só uma URL igual a qualquer uma do Storage, o resto do
    app não precisa saber a origem

**Bugs corrigidos nesta rodada** (ambos eram falha silenciosa, não do
banco): upload de áudio-guia e criação de anotação em PDF não davam
nenhum feedback quando falhavam — `SongManager`/`PdfViewer` agora mostram
o erro real. A anotação em PDF tinha também um bug de verdade: o overlay
de clique não tinha `z-index`, então a camada de texto do `react-pdf`
(`.textLayer`, z-index 2) capturava o clique antes dele chegar no
overlay — corrigido com z-index explícito + `pointer-events` condicional.

**Ainda falta no Painel Administrativo:** CRUD de Aulas e Eventos (fica
para quando as telas de Aulas/Agenda existirem — não faz sentido cadastrar
conteúdo pra uma tela que ainda não existe).

**Próximas etapas (nesta ordem, seguindo o roadmap original):**
1. Aulas recorrentes com materiais (tela de visualização + CRUD no Admin)
2. Agenda — calendário mensal (tela de visualização + CRUD no Admin)

**Nota técnica sobre build local:** `npm run build` sem
`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` definidos produz um bundle
suspeitosamente pequeno — o `throw` incondicional em `src/lib/supabase.ts`
faz o bundler eliminar o app inteiro como código morto (tudo que depende
do cliente Supabase vira inalcançável). Isso não é bug: é só um lembrete
de sempre ter um `.env` (mesmo com valores fake) ao rodar build local
para conferir o bundle de verdade. No Netlify/Vercel isso nunca acontece
porque as env vars já estão configuradas no ambiente de build.
