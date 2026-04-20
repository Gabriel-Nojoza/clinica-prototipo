import * as dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const projectRef = SUPABASE_URL.split("//")[1].split(".")[0];

const sql = `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'exams_insert'
    ) THEN
      CREATE POLICY "exams_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exams');
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'exams_select'
    ) THEN
      CREATE POLICY "exams_select" ON storage.objects FOR SELECT USING (bucket_id = 'exams');
    END IF;
  END $$;
`;

async function main() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  console.log("Status:", res.status);
  console.log("Resposta:", body);
}

main();
