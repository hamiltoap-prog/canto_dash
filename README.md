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
   (`0001_init.sql`, depois `0002_storage.sql`).
4. Em **Project Settings → API**, copie a `Project URL` e a `anon public
   key` para `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no seu `.env`
   (e nas variáveis de ambiente do Vercel/Netlify quando for publicar).
5. Para criar o primeiro grupo e o primeiro admin: cadastre-se pelo app
   (`/cadastro`), confirme o e-mail, depois insira manualmente as linhas em
   `groups` e `group_members` (role `'admin'`) pelo Table Editor do
   Supabase — depois disso o próprio admin gerencia tudo pelo painel.

## Deploy (gratuito)

Publique o repositório no GitHub e conecte no [Vercel](https://vercel.com)
ou [Netlify](https://netlify.com) (ambos têm plano free generoso e cada
push já publica). Configure lá as mesmas variáveis de ambiente do `.env`.
Os arquivos `vercel.json` e `netlify.toml` já cuidam do rewrite de SPA
(client-side routing).

## Estado do desenvolvimento

Concluído nesta etapa: setup do repositório, schema do banco com RLS por
grupo, autenticação (cadastro/login/recuperação de senha), seleção de
grupo e o "shell" do dashboard (header com filtro de naipe tematizado,
tema claro/escuro, navegação por abas).

Próximas etapas (ver `CLAUDE.md`): tela de Repertório completa (CRUD,
visualizador de PDF, player de áudio com loop A/B e velocidade reduzida,
anotações em PDF), Aulas, Agenda e Painel Administrativo completo.
