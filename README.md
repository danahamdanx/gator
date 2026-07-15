# Gator CLI

Gator is a command-line RSS feed aggregator built with TypeScript, PostgreSQL, and Drizzle ORM.

Gator allows users to create accounts, manage RSS feeds, follow feeds, collect posts from RSS sources, and browse saved posts directly from the terminal.

## Features

- User registration and login
- PostgreSQL database integration
- Database migrations using Drizzle Kit
- Add and manage RSS feeds
- Follow and unfollow feeds
- Automatically fetch RSS feeds
- Store RSS posts in the database
- Browse latest posts from followed feeds
- Command-line interface

---

# Requirements

Before running Gator, make sure you have:

- Node.js installed
- npm installed
- PostgreSQL installed and running

Recommended versions:

- Node.js v20+
- PostgreSQL v16+

---

# Installation

Clone the repository:

```bash
git clone https://github.com/danahamdanx/gator.git
cd gator
```

Install dependencies:

```bash
npm install
```

---

# Database Setup

Make sure PostgreSQL is running.

Create the database:

```sql
CREATE DATABASE gator;
```

Create a configuration file:

```
~/.gatorconfig.json
```

Example configuration:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
  "current_user_name": ""
}
```

Update the database URL according to your PostgreSQL username and password.

---

# Database Migrations

Generate migrations:

```bash
npm run generate
```

Run migrations:

```bash
npm run migrate
```

---

# Running the CLI

Run commands using:

```bash
npm run start <command>
```

Example:

```bash
npm run start users
```

---

# Commands

## Register

Creates a new user and automatically logs them in.

Usage:

```bash
npm run start register <username>
```

Example:

```bash
npm run start register alice
```

---

## Login

Logs in an existing user.

Usage:

```bash
npm run start login <username>
```

Example:

```bash
npm run start login alice
```

---

## Users

Lists all users and shows the currently logged-in user.

Usage:

```bash
npm run start users
```

Example output:

```
* alice
* bob (current)
* charlie
```

---

## Reset

Deletes all users and related data.

Useful for development and testing.

Usage:

```bash
npm run start reset
```

---

# Feeds

## Add Feed

Adds a new RSS feed and automatically follows it.

Usage:

```bash
npm run start addfeed "<feed name>" <feed url>
```

Example:

```bash
npm run start addfeed "Boot Blog" https://www.wagslane.dev/index.xml
```

---

## List Feeds

Shows all feeds stored in the database.

Usage:

```bash
npm run start feeds
```

Example output:

```
Name: Boot Blog
URL: https://www.wagslane.dev/index.xml
User: alice
```

---

## Follow Feed

Allows the current user to follow an existing feed.

Usage:

```bash
npm run start follow <feed url>
```

Example:

```bash
npm run start follow https://hnrss.org/newest
```

---

## Following

Shows all feeds followed by the current user.

Usage:

```bash
npm run start following
```

Example output:

```
* Boot Blog
* Hacker News RSS
```

---

## Unfollow Feed

Removes a feed from the current user's follows.

Usage:

```bash
npm run start unfollow <feed url>
```

Example:

```bash
npm run start unfollow https://hnrss.org/newest
```

---

# Aggregation

The aggregator fetches RSS feeds, parses their content, and stores posts in the database.

Usage:

```bash
npm run start agg <time>
```

Example:

```bash
npm run start agg 30s
```

Supported durations:

```
ms
s
m
h
```

The aggregator runs continuously until stopped.

Stop it with:

```
CTRL + C
```

---

# Browse Posts

Displays the latest posts from feeds followed by the current user.

Default limit:

```bash
npm run start browse
```

Example:

```
Title: The Zen of Proverbs
URL: https://wagslane.dev/posts/zen-of-proverbs/
```

Custom limit:

```bash
npm run start browse 10
```

---

# Project Structure

```
gator/
│
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── rss.ts
│   ├── scrape.ts
│   │
│   └── lib/
│       └── db/
│           ├── index.ts
│           ├── schema.ts
│           └── queries/
│
├── drizzle.config.ts
├── package.json
└── README.md
```

---

# Technologies Used

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- fast-xml-parser

---

# Development Commands

Install packages:

```bash
npm install
```

Generate migrations:

```bash
npm run generate
```

Run migrations:

```bash
npm run migrate
```

Start application:

```bash
npm run start <command>
```

---

# Notes

- Configuration is stored in `~/.gatorconfig.json`.
- PostgreSQL must be running before using database commands.
- RSS feeds should not be fetched too frequently to avoid excessive requests.
- This project was built as a backend learning project focusing on TypeScript, databases, SQL, APIs, and CLI development.
