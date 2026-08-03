-- ============================================================================
-- Aulas recorrentes + cancelamento por ocorrência
--
-- Uma aula pode se repetir semanalmente (mesmo dia da semana de
-- `class_date`) até `recurrence_end_date`. As ocorrências NÃO são
-- materializadas em linhas — são calculadas no cliente a partir do
-- intervalo (ver src/lib/recurrence.ts). Isso evita precisar de um cron/
-- scheduler (custo zero) e qualquer edição na aula já propaga pra todas
-- as ocorrências futuras automaticamente, sem precisar "regenerar" nada.
--
-- O que precisa persistir é só a EXCEÇÃO: quando um admin cancela uma
-- ocorrência específica (ex.: não vai ter aula nesta terça por feriado),
-- sem cancelar a série toda.
-- ============================================================================

alter table recurring_classes add column is_recurring boolean not null default false;
alter table recurring_classes add column recurrence_end_date date;

create table class_cancellations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references recurring_classes (id) on delete cascade,
  occurrence_date date not null,
  created_at timestamptz not null default now(),
  unique (class_id, occurrence_date)
);

alter table class_cancellations enable row level security;

create policy "cancellations_select_member" on class_cancellations for select
  using (is_group_member((select group_id from recurring_classes where recurring_classes.id = class_cancellations.class_id)));

create policy "cancellations_write_admin" on class_cancellations for all
  using (is_group_admin((select group_id from recurring_classes where recurring_classes.id = class_cancellations.class_id)))
  with check (is_group_admin((select group_id from recurring_classes where recurring_classes.id = class_cancellations.class_id)));
