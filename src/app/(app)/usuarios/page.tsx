import { redirect } from "next/navigation";
import { InviteUsuarioButton } from "@/modules/usuarios/components/InviteUsuarioButton";
import { UsuariosTable } from "@/modules/usuarios/components/UsuariosTable";
import { getUsuarios } from "@/modules/usuarios/queries";
import { getCurrentUser } from "@/lib/auth/profile";

export default async function UsuariosPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") redirect("/");

  const usuarios = await getUsuarios();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Administração
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Usuários
          </h1>
          <p className="mt-1 text-sm text-brand-graphite-light">
            {usuarios.length} {usuarios.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
          </p>
        </div>
        <InviteUsuarioButton />
      </div>

      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}
