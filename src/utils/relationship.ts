import type { RelationshipStatus } from '../db/cycleProfile';
import { parseISODate } from './cycleCalculations';

export const RELATIONSHIP_LABELS: Record<RelationshipStatus, string> = {
  namorando: 'namoro',
  noivos: 'noivado',
  casados: 'casamento',
};

/** Human-readable "X anos e Y meses" since a relationship/anniversary start date. */
export function formatRelationshipDuration(startDateIso: string, today: Date = new Date()): string {
  const start = parseISODate(startDateIso);

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) return 'Começou hoje';

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);

  return `${parts.join(' e ')} juntos`;
}
