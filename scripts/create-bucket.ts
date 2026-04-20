import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  const { data, error } = await supabase.storage.createBucket("exams", {
    public: true,
    allowedMimeTypes: ["application/pdf"],
  });
  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
  console.log(error ? "Bucket 'exams' ja existe." : "Bucket 'exams' criado com sucesso.", data);
}
main();
