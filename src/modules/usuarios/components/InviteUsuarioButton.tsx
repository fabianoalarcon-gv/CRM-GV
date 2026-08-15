"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { Role } from "@/lib/auth/types";
import { inviteUsuario } from "../actions";
import type { InviteUsuarioInput } from "../types";

const ROLE_OPTIONS = [
  { value: "comercial", label: "Comercial" },
  { value: "admin", label: "Admin" },
];

const EMPTY_VALUES: InviteUsuarioInput = { email: "", full_name: "", role: "comercial", password: "" };

export function InviteUsuarioButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<InviteUsuarioInput>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function close() {
    setIsOpen(false);
    setValues(EMPTY_VALUES);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await inviteUsuario(values);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    close();
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        + Novo Usuário
      </Button>

      <Modal isOpen={isOpen} onClose={close} title="Convidar usuário" className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome"
            required
            value={values.full_name}
            onChange={(e) => setValues((prev) => ({ ...prev, full_name: e.target.value }))}
          />
          <Input
            label="E-mail"
            type="email"
            required
            value={values.email}
            onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Select
            label="Perfil"
            value={values.role}
            onChange={(e) => setValues((prev) => ({ ...prev, role: e.target.value as Role }))}
            options={ROLE_OPTIONS}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={values.password}
            onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
          />
          <p className="text-xs text-brand-graphite-light">
            Essa é uma senha provisória. No primeiro login, o usuário será solicitado a
            definir uma nova senha antes de acessar o sistema.
          </p>
          {error && <p className="text-sm text-temp-quente">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando…" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
