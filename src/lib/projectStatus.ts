import type { ProjectStatus } from '../types/domain'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planejado: 'Planejado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planejado: '#6e6e73',
  em_andamento: '#0a5fd9',
  concluido: '#4c7f66',
  cancelado: '#a85b6c',
}
