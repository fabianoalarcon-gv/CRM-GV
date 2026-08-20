"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getUnreadNotifications, markNotificationsAsRead } from "../actions";
import type { Notificacao } from "../types";
import { NotificationsModal } from "./NotificationsModal";

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Pausa o polling enquanto o modal está aberto — senão a próxima rodada
    // (a cada 30s) sobrescreve a lista no meio da leitura do usuário.
    if (isOpen) return;

    // Fechar e reabrir rapidinho pode deixar uma busca antiga ainda em voo
    // quando o efeito já foi limpo (isOpen virou true de novo) — sem essa
    // flag, ela resolveria depois e sobrescreveria a lista com um snapshot
    // desatualizado.
    let cancelled = false;

    async function load() {
      const data = await getUnreadNotifications();
      if (!cancelled) setNotifications(data);
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOpen]);

  // Marca só a notificação clicada como lida — abrir/fechar o sino não some
  // mais com nenhuma; as que não forem clicadas continuam na central e o
  // sino continua acusando não lidas.
  async function handleMarkAsRead(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await markNotificationsAsRead([id]);
  }

  // Marca de uma vez só as notificações exibidas neste exato momento — se
  // alguma nova chegar depois do clique (via polling), ela não entra nessa
  // leva e continua aparecendo normalmente.
  async function handleMarkAllAsRead() {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    setNotifications([]);
    await markNotificationsAsRead(ids);
  }

  const hasUnread = notifications.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Notificações"
        aria-label={hasUnread ? "Notificações — há novidades" : "Notificações"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04]"
      >
        <Icon name="notifications" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-temp-quente ring-2 ring-surface" />
        )}
      </button>
      <NotificationsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </>
  );
}
