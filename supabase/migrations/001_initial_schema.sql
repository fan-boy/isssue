-- ============================================
-- ZINE APP - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  color text default '#e57373',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Zines
create table public.zines (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  release_day int check (release_day >= 1 and release_day <= 28) default 1,
  created_at timestamptz default now() not null
);

-- Memberships (many-to-many between users and zines)
create table public.memberships (
  id uuid default uuid_generate_v4() primary key,
  zine_id uuid references public.zines(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'member')) default 'member' not null,
  joined_at timestamptz default now() not null,
  unique(zine_id, user_id)
);

-- Issues
create table public.issues (
  id uuid default uuid_generate_v4() primary key,
  zine_id uuid references public.zines(id) on delete cascade not null,
  issue_number int not null,
  month text not null, -- "2026-03"
  status text check (status in ('draft', 'locked', 'published')) default 'draft' not null,
  edit_deadline timestamptz not null,
  release_date timestamptz not null,
  created_at timestamptz default now() not null,
  unique(zine_id, issue_number)
);

-- Pages
create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references public.issues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  page_number int not null,
  content jsonb default '{"blocks": [], "background": {"type": "color", "value": "#f5f3eb"}}' not null,
  updated_at timestamptz default now() not null,
  unique(issue_id, user_id)
);

-- Annotations
create table public.annotations (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references public.pages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('highlight', 'pen')) not null,
  path_data text not null,
  color text not null,
  created_at timestamptz default now() not null
);

-- Invites (for email invitations)
create table public.invites (
  id uuid default uuid_generate_v4() primary key,
  zine_id uuid references public.zines(id) on delete cascade not null,
  email text not null,
  invited_by uuid references public.profiles(id) on delete cascade not null,
  accepted boolean default false,
  created_at timestamptz default now() not null,
  unique(zine_id, email)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_zine on public.memberships(zine_id);
create index idx_issues_zine on public.issues(zine_id);
create index idx_pages_issue on public.pages(issue_id);
create index idx_pages_user on public.pages(user_id);
create index idx_annotations_page on public.annotations(page_id);
create index idx_invites_email on public.invites(email);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.zines enable row level security;
alter table public.memberships enable row level security;
alter table public.issues enable row level security;
alter table public.pages enable row level security;
alter table public.annotations enable row level security;
alter table public.invites enable row level security;

-- Profiles: users can read all profiles, update only their own
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Zines: members can view, owners can update/delete
create policy "Zines viewable by members" on public.zines
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.zine_id = zines.id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Users can create zines" on public.zines
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update zines" on public.zines
  for update using (auth.uid() = owner_id);

create policy "Owners can delete zines" on public.zines
  for delete using (auth.uid() = owner_id);

-- Memberships: members can view their zine's memberships
create policy "Memberships viewable by zine members" on public.memberships
  for select using (
    exists (
      select 1 from public.memberships m
      where m.zine_id = memberships.zine_id
      and m.user_id = auth.uid()
    )
  );

create policy "Owners can manage memberships" on public.memberships
  for all using (
    exists (
      select 1 from public.zines
      where zines.id = memberships.zine_id
      and zines.owner_id = auth.uid()
    )
  );

create policy "Users can join via invite" on public.memberships
  for insert with check (auth.uid() = user_id);

-- Issues: members can view
create policy "Issues viewable by zine members" on public.issues
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.zine_id = issues.zine_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Owners can manage issues" on public.issues
  for all using (
    exists (
      select 1 from public.zines
      where zines.id = issues.zine_id
      and zines.owner_id = auth.uid()
    )
  );

-- Pages: own page always visible, others only when published
create policy "Users can view own page" on public.pages
  for select using (auth.uid() = user_id);

create policy "Published pages viewable by zine members" on public.pages
  for select using (
    exists (
      select 1 from public.issues
      join public.memberships on memberships.zine_id = issues.zine_id
      where issues.id = pages.issue_id
      and issues.status = 'published'
      and memberships.user_id = auth.uid()
    )
  );

create policy "Users can update own page" on public.pages
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from public.issues
      where issues.id = pages.issue_id
      and issues.status = 'draft'
    )
  );

create policy "Users can insert own page" on public.pages
  for insert with check (auth.uid() = user_id);

-- Annotations: only on published issues
create policy "Annotations viewable on published issues" on public.annotations
  for select using (
    exists (
      select 1 from public.pages
      join public.issues on issues.id = pages.issue_id
      join public.memberships on memberships.zine_id = issues.zine_id
      where pages.id = annotations.page_id
      and issues.status = 'published'
      and memberships.user_id = auth.uid()
    )
  );

create policy "Users can annotate published pages" on public.annotations
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.pages
      join public.issues on issues.id = pages.issue_id
      where pages.id = annotations.page_id
      and issues.status = 'published'
    )
  );

create policy "Users can delete own annotations" on public.annotations
  for delete using (auth.uid() = user_id);

-- Invites
create policy "Invites viewable by zine owners" on public.invites
  for select using (
    exists (
      select 1 from public.zines
      where zines.id = invites.zine_id
      and zines.owner_id = auth.uid()
    )
  );

create policy "Invited users can view their invites" on public.invites
  for select using (
    email = (select email from public.profiles where id = auth.uid())
  );

create policy "Owners can create invites" on public.invites
  for insert with check (
    exists (
      select 1 from public.zines
      where zines.id = invites.zine_id
      and zines.owner_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    (array['#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65'])[floor(random() * 16 + 1)]
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create membership when zine is created
create or replace function public.handle_new_zine()
returns trigger as $$
begin
  insert into public.memberships (zine_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_zine_created
  after insert on public.zines
  for each row execute procedure public.handle_new_zine();

-- Auto-create pages for all members when issue is created
create or replace function public.handle_new_issue()
returns trigger as $$
declare
  member record;
  page_num int := 1;
begin
  for member in
    select user_id from public.memberships
    where zine_id = new.zine_id
    order by joined_at
  loop
    insert into public.pages (issue_id, user_id, page_number)
    values (new.id, member.user_id, page_num);
    page_num := page_num + 1;
  end loop;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_issue_created
  after insert on public.issues
  for each row execute procedure public.handle_new_issue();

-- Update timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_pages_updated_at
  before update on public.pages
  for each row execute procedure public.update_updated_at();

-- ============================================
-- STORAGE
-- ============================================

-- Create bucket for page images
insert into storage.buckets (id, name, public)
values ('page-images', 'page-images', true);

-- Storage policies
create policy "Anyone can view page images" on storage.objects
  for select using (bucket_id = 'page-images');

create policy "Authenticated users can upload images" on storage.objects
  for insert with check (
    bucket_id = 'page-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can update own images" on storage.objects
  for update using (
    bucket_id = 'page-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own images" on storage.objects
  for delete using (
    bucket_id = 'page-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
