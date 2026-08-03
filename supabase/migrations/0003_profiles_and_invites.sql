-- ============================================================================
-- profiles + convite de membro por e-mail
--
-- auth.users não é consultável pelo cliente (Supabase bloqueia isso por
-- design), mas o Painel Administrativo precisa: (1) mostrar o e-mail dos
-- membros de um grupo, e (2) permitir que um admin adicione alguém ao
-- grupo digitando o e-mail dessa pessoa. profiles é um espelho mínimo
-- (id, email) mantido em sincronia via trigger em auth.users.
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Backfill para contas já existentes (ex.: quem já se cadastrou antes desta migration).
insert into profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create function handle_new_user() returns trigger
  language plpgsql security definer as $$
  begin
    insert into profiles (id, email) values (new.id, new.email)
    on conflict (id) do update set email = excluded.email;
    return new;
  end;
  $$;

create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function handle_new_user();

-- Segunda FK no mesmo tipo de valor (user_id já referencia auth.users) só
-- para o PostgREST conseguir fazer o embed `group_members?select=*,profiles(email)`
-- nas telas de admin.
alter table group_members
  add constraint group_members_user_id_profiles_fkey
  foreign key (user_id) references profiles (id) on delete cascade;

alter table profiles enable row level security;

-- Um usuário sempre vê o próprio e-mail; um admin também vê o e-mail de
-- quem compartilha com ele algum grupo onde ele é admin (necessário para
-- listar membros no Painel Administrativo).
create policy "profiles_select_self_or_shared_group_admin" on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from group_members gm_target
      join group_members gm_admin on gm_admin.group_id = gm_target.group_id
      where gm_target.user_id = profiles.id
        and gm_admin.user_id = auth.uid()
        and gm_admin.role = 'admin'
    )
  );

-- ============================================================================
-- create_group_with_admin — resolve o problema do "ovo e a galinha": a
-- policy de escrita em `groups` exige ser admin do grupo, mas um grupo
-- novo ainda não tem nenhum admin. Esta função cria o grupo e a
-- membership de admin do próprio chamador numa transação só, então o
-- usuário só consegue virar admin do grupo que ele mesmo está criando —
-- não de nenhum outro.
-- ============================================================================
create function create_group_with_admin(p_name text, p_description text default null)
  returns groups
  language plpgsql security definer as $$
  declare
    new_group groups;
  begin
    insert into groups (name, description) values (p_name, p_description)
    returning * into new_group;

    insert into group_members (user_id, group_id, role)
    values (auth.uid(), new_group.id, 'admin');

    return new_group;
  end;
  $$;

-- ============================================================================
-- invite_member — admin adiciona alguém ao grupo pelo e-mail. A pessoa
-- precisa já ter criado conta (confirma o e-mail dela existir em
-- profiles); a função checa que o chamador é admin do grupo antes de
-- inserir, então client-side não precisa (nem consegue, via RLS) inserir
-- em group_members de um grupo alheio.
-- ============================================================================
create function invite_member(p_group_id uuid, p_email text, p_role member_role default 'member')
  returns void
  language plpgsql security definer as $$
  declare
    target_user_id uuid;
  begin
    if not is_group_admin(p_group_id) then
      raise exception 'Apenas administradores do grupo podem convidar membros.';
    end if;

    select id into target_user_id from profiles where lower(email) = lower(p_email);

    if target_user_id is null then
      raise exception 'Nenhuma conta encontrada com esse e-mail. Peça para a pessoa se cadastrar primeiro.';
    end if;

    insert into group_members (user_id, group_id, role)
    values (target_user_id, p_group_id, p_role)
    on conflict (user_id, group_id) do update set role = excluded.role;
  end;
  $$;
