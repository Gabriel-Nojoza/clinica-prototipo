import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = "admin.clinica@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Administrador";

async function main() {
  console.log("Criando usuario admin...");

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: "admin",
      full_name: ADMIN_NAME,
    },
  });

  if (error) {
    console.error("Erro ao criar usuario:", error.message);
    process.exit(1);
  }

  const userId = data.user.id;
  console.log("Usuario criado:", userId);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin", full_name: ADMIN_NAME })
    .eq("id", userId);

  if (profileError) {
    console.error("Erro ao definir role admin:", profileError.message);
    process.exit(1);
  }

  console.log("Acesso admin criado com sucesso!");
  console.log("  Email:", ADMIN_EMAIL);
  console.log("  Senha:", ADMIN_PASSWORD);
}

main();
