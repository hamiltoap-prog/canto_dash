-- ============================================================================
-- Gestão Musical — schema inicial + RLS por grupo
-- Todo o controle de acesso vive aqui, não só na interface: group_members é
-- a fonte de verdade, e cada policy consulta essa tabela.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- groups / group_members
-- ---------------------------------------------------------------------------
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  theme_color text,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type member_role as enum ('admin', 'member');

create table group_members (
  user_id uuid not null references auth.users (id) on delete cascade,
  group_id uuid not null references groups (id) on delete cascade,
  role member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

-- Helper: is the current user a member/admin of a given group?
-- security definer + stable so it can be reused inside RLS policies without
-- recursively re-checking RLS on group_members itself.
create function is_group_member(target_group_id uuid) returns boolean
  language sql security definer stable as $$
    select exists (
      select 1 from group_members
      where group_id = target_group_id and user_id = auth.uid()
    )
  $$;

create function is_group_admin(target_group_id uuid) returns boolean
  language sql security definer stable as $$
    select exists (
      select 1 from group_members
      where group_id = target_group_id and user_id = auth.uid() and role = 'admin'
    )
  $$;

-- ---------------------------------------------------------------------------
-- projects / songs
-- ---------------------------------------------------------------------------
create type project_status as enum ('planejado', 'em_andamento', 'concluido', 'cancelado');

create table projects (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  name text not null,
  event_date date,
  time time,
  venue text,
  address text,
  description text,
  costume_photos text[] not null default '{}',
  color_palette text[] not null default '{}',
  notes text,
  status project_status not null default 'planejado',
  created_at timestamptz not null default now()
);

create table songs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  name text not null,
  "order" integer not null default 0,
  sheet_music jsonb not null default '{}',
  guide_audio jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- recurring_classes / class_materials
-- ---------------------------------------------------------------------------
create table recurring_classes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  name text not null,
  class_date date not null,
  time time,
  venue text,
  description text,
  created_at timestamptz not null default now()
);

create type material_kind as enum ('pdf', 'audio', 'image', 'link');

create table class_materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references recurring_classes (id) on delete cascade,
  label text not null,
  file_url text not null,
  kind material_kind not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- calendar_events
-- ---------------------------------------------------------------------------
create type calendar_event_type as enum ('aula', 'ensaio', 'apresentacao', 'outro');

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  type calendar_event_type not null,
  title text not null,
  event_date date not null,
  time time,
  venue text,
  description text,
  color text,
  related_project_id uuid references projects (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- audio_loop_markers — melhoria: marcadores A/B de loop + velocidade,
-- salvos por usuário e por naipe/música, para retomar o treino depois.
-- ---------------------------------------------------------------------------
create type naipe as enum ('geral', 'soprano', 'contralto', 'tenor', 'baixo', 'solo');

create table audio_loop_markers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  song_id uuid not null references songs (id) on delete cascade,
  naipe naipe not null,
  label text,
  point_a numeric not null,
  point_b numeric not null,
  playback_rate numeric not null default 1,
  created_at timestamptz not null default now(),
  constraint loop_range_valid check (point_b > point_a)
);

-- ---------------------------------------------------------------------------
-- pdf_annotations — melhoria: anotações em PDFs (letra ou partitura).
-- Anotação de admin com visibility='public' é vista por todo o grupo;
-- anotação de membro comum é sempre privada (só o autor vê).
-- ---------------------------------------------------------------------------
create type annotation_visibility as enum ('public', 'private');
create type annotation_material_kind as enum ('sheet_music', 'class_material');

create table pdf_annotations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  song_id uuid not null references songs (id) on delete cascade,
  material_kind annotation_material_kind not null,
  page integer not null,
  x numeric not null,
  y numeric not null,
  content text not null,
  visibility annotation_visibility not null default 'private',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table groups enable row level security;
alter table group_members enable row level security;
alter table projects enable row level security;
alter table songs enable row level security;
alter table recurring_classes enable row level security;
alter table class_materials enable row level security;
alter table calendar_events enable row level security;
alter table audio_loop_markers enable row level security;
alter table pdf_annotations enable row level security;

-- groups: visible/editable only to members of that group; admins write.
create policy "groups_select_member" on groups for select
  using (is_group_member(id));
create policy "groups_write_admin" on groups for all
  using (is_group_admin(id)) with check (is_group_admin(id));

-- group_members: a user sees their own membership rows; admins see/manage
-- every membership row of groups they administer.
create policy "group_members_select_self" on group_members for select
  using (user_id = auth.uid() or is_group_admin(group_id));
create policy "group_members_write_admin" on group_members for insert
  with check (is_group_admin(group_id));
create policy "group_members_update_admin" on group_members for update
  using (is_group_admin(group_id)) with check (is_group_admin(group_id));
create policy "group_members_delete_admin" on group_members for delete
  using (is_group_admin(group_id));

-- projects
create policy "projects_select_member" on projects for select
  using (is_group_member(group_id));
create policy "projects_write_admin" on projects for all
  using (is_group_admin(group_id)) with check (is_group_admin(group_id));

-- songs: scoped through the parent project's group
create policy "songs_select_member" on songs for select
  using (is_group_member((select group_id from projects where projects.id = songs.project_id)));
create policy "songs_write_admin" on songs for all
  using (is_group_admin((select group_id from projects where projects.id = songs.project_id)))
  with check (is_group_admin((select group_id from projects where projects.id = songs.project_id)));

-- recurring_classes
create policy "classes_select_member" on recurring_classes for select
  using (is_group_member(group_id));
create policy "classes_write_admin" on recurring_classes for all
  using (is_group_admin(group_id)) with check (is_group_admin(group_id));

-- class_materials: scoped through the parent class's group
create policy "materials_select_member" on class_materials for select
  using (is_group_member((select group_id from recurring_classes where recurring_classes.id = class_materials.class_id)));
create policy "materials_write_admin" on class_materials for all
  using (is_group_admin((select group_id from recurring_classes where recurring_classes.id = class_materials.class_id)))
  with check (is_group_admin((select group_id from recurring_classes where recurring_classes.id = class_materials.class_id)));

-- calendar_events
create policy "events_select_member" on calendar_events for select
  using (is_group_member(group_id));
create policy "events_write_admin" on calendar_events for all
  using (is_group_admin(group_id)) with check (is_group_admin(group_id));

-- audio_loop_markers: strictly private practice bookmarks — only the owner
-- ever reads or writes their own rows, regardless of admin role.
create policy "loop_markers_owner_select" on audio_loop_markers for select
  using (user_id = auth.uid());
create policy "loop_markers_owner_insert" on audio_loop_markers for insert
  with check (
    user_id = auth.uid()
    and is_group_member((select group_id from projects p join songs s on s.project_id = p.id where s.id = song_id))
  );
create policy "loop_markers_owner_delete" on audio_loop_markers for delete
  using (user_id = auth.uid());

-- pdf_annotations: readable if it's public within the caller's group, or if
-- it's the caller's own (public or private) annotation. Only admins may
-- write visibility='public'; members may only ever write their own private
-- annotations.
create policy "annotations_select_visible" on pdf_annotations for select
  using (
    is_group_member(group_id)
    and (visibility = 'public' or user_id = auth.uid())
  );
create policy "annotations_insert_own" on pdf_annotations for insert
  with check (
    user_id = auth.uid()
    and is_group_member(group_id)
    and (visibility = 'private' or is_group_admin(group_id))
  );
create policy "annotations_delete_own_or_admin" on pdf_annotations for delete
  using (user_id = auth.uid() or is_group_admin(group_id));
