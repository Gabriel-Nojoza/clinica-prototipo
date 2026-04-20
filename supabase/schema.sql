create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'admin')),
  full_name text not null,
  cpf text,
  birth_date date,
  phone text,
  email text not null,
  address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  channel text not null default 'app',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists appointments_scheduled_slot_idx
on public.appointments (doctor_id, appointment_date, appointment_time)
where status = 'scheduled';

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  exam_name text not null,
  category text not null,
  requested_by text not null,
  collected_at date not null,
  result_status text not null default 'processing' check (result_status in ('available', 'processing')),
  summary text not null,
  observations text[] not null default '{}',
  pdf_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_doctors_updated_at on public.doctors;
create trigger set_doctors_updated_at
before update on public.doctors
for each row execute function public.set_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists set_exams_updated_at on public.exams;
create trigger set_exams_updated_at
before update on public.exams
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    full_name,
    cpf,
    birth_date,
    phone,
    email,
    address
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient'),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Paciente'),
    new.raw_user_meta_data ->> 'cpf',
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    new.raw_user_meta_data ->> 'phone',
    new.email,
    new.raw_user_meta_data ->> 'address'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    cpf = excluded.cpf,
    birth_date = excluded.birth_date,
    phone = excluded.phone,
    address = excluded.address;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.exams enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id or public.is_admin())
with check ((select auth.uid()) = id or public.is_admin());

drop policy if exists "doctors_read_authenticated" on public.doctors;
create policy "doctors_read_authenticated"
on public.doctors
for select
to authenticated
using (true);

drop policy if exists "doctors_admin_write" on public.doctors;
create policy "doctors_admin_write"
on public.doctors
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "appointments_select_own_or_admin" on public.appointments;
create policy "appointments_select_own_or_admin"
on public.appointments
for select
to authenticated
using (patient_id = (select auth.uid()) or public.is_admin());

drop policy if exists "appointments_insert_own_or_admin" on public.appointments;
create policy "appointments_insert_own_or_admin"
on public.appointments
for insert
to authenticated
with check (patient_id = (select auth.uid()) or public.is_admin());

drop policy if exists "appointments_update_own_or_admin" on public.appointments;
create policy "appointments_update_own_or_admin"
on public.appointments
for update
to authenticated
using (patient_id = (select auth.uid()) or public.is_admin())
with check (patient_id = (select auth.uid()) or public.is_admin());

drop policy if exists "exams_select_own_or_admin" on public.exams;
create policy "exams_select_own_or_admin"
on public.exams
for select
to authenticated
using (patient_id = (select auth.uid()) or public.is_admin());

drop policy if exists "exams_admin_write" on public.exams;
create policy "exams_admin_write"
on public.exams
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.doctors (name, specialty)
values
  ('Dra. Helena Prado', 'Clinica Geral'),
  ('Dr. Rafael Moura', 'Cardiologia'),
  ('Dra. Camila Nunes', 'Pediatria')
on conflict do nothing;

-- Promova manualmente um usuario para admin apos criar a conta:
-- update public.profiles set role = 'admin' where email = 'seu-email-admin@dominio.com';
