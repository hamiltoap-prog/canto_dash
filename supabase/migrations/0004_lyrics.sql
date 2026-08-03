-- ============================================================================
-- Letra da música — PDF separado da partitura (não é por naipe: a letra é
-- a mesma pra todo mundo cantar junto, diferente da partitura que muda
-- por voz). O brief original já previa "anotar PDFs de letra ou
-- partitura" (3b), mas só a partitura tinha um slot de verdade até agora.
-- ============================================================================

alter table songs add column lyrics_pdf text;

-- Anotações em PDF de letra ficam num namespace próprio (páginas/posições
-- não têm relação nenhuma com as da partitura do mesmo song_id).
alter type annotation_material_kind add value 'lyrics';
