-- Drop existing tables if they exist
drop table if exists public.posts;
drop table if exists public.profiles;

-- Create profiles table first (since posts will reference it)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table with proper foreign key
create table public.posts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index posts_user_id_idx on public.posts(user_id);
create index profiles_username_idx on public.profiles(username);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Posts policies
create policy "Public posts are viewable by everyone"
    on public.posts for select
    using (true);

create policy "Users can insert their own posts"
    on public.posts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own posts"
    on public.posts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own posts"
    on public.posts for delete
    using (auth.uid() = user_id);

-- Function to handle user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, username, avatar_url)
    values (new.id, split_part(new.email, '@', 1), null);
    return new;
end;
$$;

-- Trigger to automatically create profile for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user(); 