-- Create the profiles table first (it's referenced by posts)
create table public.profiles (
    id uuid not null primary key references auth.users on delete cascade,
    username text,
    avatar_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create the posts table with reference to profiles
create table public.posts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Profiles policies
create policy "Anyone can view profiles"
    on public.profiles
    for select
    using (true);

create policy "Users can insert their own profile"
    on public.profiles
    for insert
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles
    for update
    using (auth.uid() = id);

-- Posts policies
create policy "Anyone can view posts"
    on public.posts
    for select
    using (true);

create policy "Authenticated users can create posts"
    on public.posts
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own posts"
    on public.posts
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own posts"
    on public.posts
    for delete
    using (auth.uid() = user_id);

-- Function to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user when a user is created
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Create indexes for better performance
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists profiles_username_idx on public.profiles(username);

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role; 