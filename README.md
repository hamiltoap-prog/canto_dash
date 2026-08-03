# Gestão Musical — Dashboard

Dashboard web para gestão de grupos musicais (corais): repertório com
partituras/áudios por naipe, aulas recorrentes, calendário de eventos e
painel administrativo, com login real e cada usuário vendo apenas os grupos
aos quais pertence.

Stack: React + Vite + TypeScript, Tailwind CSS, Supabase (Postgres + Auth +
Storage + Row Level Security), Zustand para estado central. Toda a stack
roda no free tier — ver `CLAUDE.md` para o brief completo do projeto.

## Setup local

```bash
npm install
cp .env.example .env
```

Preencha `.env` com as credenciais do seu projeto Supabase (veja abaixo como
criar). Depois:

```bash
npm run dev      # servidor de desenvolvimento
npm run test     # suíte de testes (Vitest)
npm run build    # build de produção
npm run lint     # lint (Oxlint)
```

## Criando o projeto Supabase (gratuito)

1. Crie uma conta em [supabase.com](https://supabase.com) (free tier).
2. Crie um novo projeto.
3. Em **SQL Editor**, rode nesta ordem os arquivos de `supabase/migrations/`
   (`0001_init.sql`, `0002_storage.sql`, `0003_profiles_and_invites.sql`).
4. Em **Project Settings → API**, copie a `Project URL` e a `anon public
   key` para `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no seu `.env`
   (e nas variáveis de ambiente do Vercel/Netlify quando for publicar).
5. Cadastre-se pelo app (`/cadastro`), confirme o e-mail, faça login e use
   o botão **"Criar meu grupo"** na tela de boas-vindas — você já vira
   admin do grupo automaticamente. Dali em diante, tudo (membros,
   projetos, músicas, upload de arquivo) é gerenciado pelo próprio painel
   administrativo (`/admin`), sem precisar mexer no Supabase de novo.

## Deploy (gratuito)

Publique o repositório no GitHub e conecte no [Vercel](https://vercel.com)
ou [Netlify](https://netlify.com) (ambos têm plano free generoso e cada
push já publica). Configure lá as mesmas variáveis de ambiente do `.env`.
Os arquivos `vercel.json` e `netlify.toml` já cuidam do rewrite de SPA
(client-side routing).

## Estado do desenvolvimento

Concluído: setup do repositório, schema do banco com RLS por grupo,
autenticação, seleção de grupo (incluindo criar o próprio grupo), shell do
dashboard, tela de Repertório (projetos, matriz de disponibilidade por
naipe, visualizador de PDF com anotações públicas/privadas, player de
áudio com loop A/B e velocidade reduzida) e Painel Administrativo (Grupo,
Membros, Projetos e Músicas — com upload de arquivo direto pro Storage).

Próximas etapas (ver `CLAUDE.md`): Aulas recorrentes e Agenda (calendário
mensal), cada uma com sua tela de visualização e o CRUD correspondente no
Painel Administrativo.
