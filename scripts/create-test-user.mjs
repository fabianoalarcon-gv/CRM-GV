// Cria (ou atualiza a senha de) um usuário de teste no Supabase Auth via Admin API.
// Uso: node --env-file=.env.local scripts/create-test-user.mjs <email> <senha>
// Requer SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no ambiente.

import { createClient } from "@supabase/supabase-js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Uso: node --env-file=.env.local scripts/create-test-user.mjs <email> <senha>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (!createError) {
  console.log(`Usuário criado: ${created.user.email} (id: ${created.user.id})`);
  process.exit(0);
}

if (!createError.message.includes("already been registered")) {
  console.error("Erro ao criar usuário:", createError.message);
  process.exit(1);
}

// Já existe — atualiza a senha para o valor informado.
const { data: list, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Erro ao buscar usuário existente:", listError.message);
  process.exit(1);
}

const existing = list.users.find((u) => u.email === email);
if (!existing) {
  console.error("Usuário não encontrado após conflito de criação.");
  process.exit(1);
}

const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
  existing.id,
  { password },
);

if (updateError) {
  console.error("Erro ao atualizar senha:", updateError.message);
  process.exit(1);
}

console.log(
  `Usuário já existia — senha atualizada: ${updated.user.email} (id: ${updated.user.id})`,
);
