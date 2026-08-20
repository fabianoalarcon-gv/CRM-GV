import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { Notificacao, NotificacaoTipo } from "../types";

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notificacao[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

const ICON_BY_TIPO: Record<NotificacaoTipo, { icon: string; color: string }> = {
  nova_empresa: { icon: "domain", color: "var(--color-brand-accent)" },
  novo_lead: { icon: "person_add", color: "var(--color-temp-frio)" },
  nova_proposta: { icon: "description", color: "var(--color-chart-cat-1)" },
  movimentacao_card: { icon: "swap_horiz", color: "var(--color-brand-graphite-light)" },
  proposta_aprovada: { icon: "check_circle", color: "var(--color-status-aprovado)" },
  proposta_reprovada: { icon: "cancel", color: "var(--color-temp-quente)" },
  nova_acao: { icon: "event", color: "var(--color-cal-reuniao)" },
  lead_sem_movimentacao: { icon: "hourglass_top", color: "var(--color-temp-quente)" },
  proposta_sem_movimentacao: { icon: "hourglass_bottom", color: "var(--color-temp-quente)" },
  empresa_sem_contato: { icon: "person_off", color: "var(--color-temp-quente)" },
  lead_sem_acao: { icon: "event_busy", color: "var(--color-temp-quente)" },
  proposta_sem_acao: { icon: "notifications_paused", color: "var(--color-temp-quente)" },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notificações" className="max-w-md">
      {notifications.length > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-brand-accent hover:underline"
          >
            Marcar todas como lidas
          </button>
        </div>
      )}
      {notifications.length === 0 ? (
        <p className="text-sm text-brand-graphite-light">Nenhuma notificação nova.</p>
      ) : (
        <ul className="flex max-h-[420px] flex-col gap-2.5 overflow-y-auto pr-1">
          {notifications.map((n) => {
            const { icon, color } = ICON_BY_TIPO[n.tipo];
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onMarkAsRead(n.id)}
                  title="Marcar como lida"
                  className="group flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-brand-accent/40 hover:bg-black/[.02]"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                      color,
                    }}
                  >
                    <Icon name={icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{n.mensagem}</p>
                    <p className="mt-1 text-xs text-brand-graphite-light">
                      {dateFormatter.format(new Date(n.createdAt))}
                      {n.autorNome && ` · ${n.autorNome}`}
                    </p>
                  </div>
                  <Icon
                    name="check"
                    size={16}
                    className="mt-1 shrink-0 self-start text-brand-graphite-light opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
