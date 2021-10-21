CREATE TABLE users (
    id serial PRIMARY KEY,
    name VARCHAR(100),
    email text UNIQUE NOT NULL,
    entries bigint DEFAULT 0,
    joined timestamp not null
);

/* Andre used the name login instead of logins*/
create TABLE logins (
    id serial PRIMARY KEY,
    hash varchar(100) not null,
    email text unique not null
);