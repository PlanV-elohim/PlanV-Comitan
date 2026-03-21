-- Table to store Admin Audit Logs
create table if not exists public.admin_logs (
    id uuid default gen_random_uuid() primary key,
    admin_email text not null,
    action_type text not null, -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    table_name text not null, -- e.g., 'camps', 'cabins'
    details jsonb, -- The payload or id of the record changed
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_logs enable row level security;

-- Policies
create policy "Admins can insert logs"
    on public.admin_logs for insert
    with check ( auth.role() = 'authenticated' );

create policy "Admins can view logs"
    on public.admin_logs for select
    using ( auth.role() = 'authenticated' );
