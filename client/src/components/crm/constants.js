export const CONTACT_TYPES = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'inversor', label: 'Inversor' },
];

export const LEAD_STATUSES = [
  { value: 'nuevo', label: 'Nuevo', color: '#60A5FA' },
  { value: 'seguimiento', label: 'En seguimiento', color: '#FBBF24' },
  { value: 'negociando', label: 'Negociando', color: '#F97316' },
  { value: 'cerrado', label: 'Cerrado', color: '#22C55E' },
  { value: 'perdido', label: 'Perdido', color: '#EF4444' },
];

export function getStatusMeta(value) {
  return LEAD_STATUSES.find((s) => s.value === value) || LEAD_STATUSES[0];
}
