import { CONTACT_TYPES, getStatusMeta } from './constants';
import { WhatsAppButton } from './WhatsAppButton';

export function ContactCard({ contact, onClick }) {
  const typeLabel = CONTACT_TYPES.find((t) => t.value === contact.type)?.label || contact.type;
  const status = getStatusMeta(contact.status);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-left active:bg-white/10"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-white">{contact.name}</p>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${status.color}22`, color: status.color }}
          >
            {status.label}
          </span>
        </div>
        <p className="truncate text-sm text-white/50">
          {typeLabel}
          {contact.phone ? ` · ${contact.phone}` : ''}
        </p>
      </div>
      <WhatsAppButton phone={contact.phone} />
    </button>
  );
}
