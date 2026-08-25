"use server";

import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "@/lib/auditoria";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { EmpresaInput, ContatoInput } from "./types";

function toRow(input: EmpresaInput) {
  return {
    nome: input.nome.trim(),
    cnpj: input.cnpj.trim() || null,
    setor: input.setor.trim() || null,
    endereco: input.endereco.trim() || null,
    numero: input.numero.trim() || null,
    cidade: input.cidade.trim() || null,
    uf: input.uf.trim() || null,
    cep: input.cep.trim() || null,
    origem_lead: input.origem_lead.trim() || null,
    site: input.site.trim() || null,
    observacoes: input.observacoes.trim() || null,
  };
}

function validate(input: EmpresaInput): string | null {
  if (!input.nome.trim()) return "Informe o nome da empresa.";
  if (!input.setor.trim()) return "Informe o setor da empresa.";
  if (!input.origem_lead.trim()) return "Informe a origem do lead.";
  return null;
}

export async function createEmpresa(input: EmpresaInput) {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas")
    .insert({ ...toRow(input), created_by: user?.id ?? null })
    .select("id")
    .single();

  if (error) return { error: error.message, id: null };

  revalidatePath("/empresas");
  return { error: null, id: data.id };
}

export async function updateEmpresa(empresaId: number, input: EmpresaInput) {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.from("empresas").update(toRow(input)).eq("id", empresaId);

  if (error) return { error: error.message };

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}

export async function deleteEmpresa(empresaId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guardado ANTES de excluir — depois do delete não tem mais como buscar
  // pra descrever no log de auditoria. Só admin chega até aqui de qualquer
  // forma (RLS de empresas_delete exige private.is_admin()).
  const { data: before } = await supabase.from("empresas").select("nome").eq("id", empresaId).maybeSingle();

  const { error } = await supabase.from("empresas").delete().eq("id", empresaId);

  if (error) return { error: error.message };

  if (before) {
    await registrarLogAuditoria(createAdminClient(), {
      acao: "empresa_excluida",
      descricao: `Excluiu a empresa ${before.nome}.`,
      autorId: user?.id ?? null,
    });
  }

  revalidatePath("/empresas");
  return { error: null };
}

function toContatoRow(input: ContatoInput) {
  return {
    nome: input.nome.trim(),
    cargo: input.cargo.trim() || null,
    email: input.email.trim() || null,
    telefone: input.telefone.trim() || null,
    telefone_tipo: input.telefone_tipo.trim() || null,
    principal: input.principal,
  };
}

export async function addContato(empresaId: number, input: ContatoInput) {
  if (!input.nome.trim()) return { error: "Informe o nome do contato." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contatos_empresa")
    .insert({ ...toContatoRow(input), empresa_id: empresaId });

  if (error) return { error: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}

export async function updateContato(contatoId: number, empresaId: number, input: ContatoInput) {
  if (!input.nome.trim()) return { error: "Informe o nome do contato." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contatos_empresa")
    .update(toContatoRow(input))
    .eq("id", contatoId);

  if (error) return { error: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}

export async function deleteContato(contatoId: number, empresaId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("contatos_empresa").delete().eq("id", contatoId);

  if (error) return { error: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}
