-- ============================================================================
-- Aulas: horário de término + endereço (pro link de mapa, mesmo padrão
-- já usado em projects.address).
-- ============================================================================

alter table recurring_classes add column end_time time;
alter table recurring_classes add column address text;
