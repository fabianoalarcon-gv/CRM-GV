"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getUnreadNotifications, markNotificationsAsRead } from "../actions";
import type { Notificacao } from "../types";
import { NotificationsModal } from "./NotificationsModal";

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getUnreadNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    // Pausa o polling enquanto o modal está aberto — senão a próxima rodada
    // (a cada 30s) busca de novo as notificações não lidas, que já foram
    // marcadas como lidas na abertura, e zera a lista visível no meio da
    // leitura do usuário.
    if (isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isOpen, refresh]);

  async function handleOpen() {
    setIsOpen(true);
    if (notifications.length > 0) {
      await markNotificationsAsRead(notifications.map((n) => n.id));
    }
  }

  function handleClose() {
    setIsOpen(false);
    // Já foram marcadas como lidas na abertura — some da lista deste usuário
    // sem esperar o próximo polling.
    setNotifications([]);
  }

  const hasUnread = notifications.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Notificações"
        aria-label={hasUnread ? "Notificações — há novidades" : "Notificações"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04]"
      >
        <Icon name="notifications" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-temp-quente ring-2 ring-surface" />
        )}
      </button>
      <NotificationsModal isOpen={isOpen} onClose={handleClose} notifications={notifications} />
    </>
  );
}
