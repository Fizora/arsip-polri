create table users (
  id uuid primary key default gen_random_uuid(),
  nrp varchar(20) not null unique,
  username varchar(50) not null unique,
  full_name varchar(100) not null,
  phone varchar(20),
  role varchar(20) default 'user',
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
