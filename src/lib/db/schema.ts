import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom()
    .notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  name: text("name")
    .notNull()
    .unique(),
});

export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  name: text("name").notNull(),

  url: text("url").notNull().unique(),
  lastFetchedAt: timestamp("last_fetched_at"),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  title: text("title").notNull(),

  url: text("url").notNull().unique(),

  description: text("description"),

  publishedAt: timestamp("published_at"),

  feedId: uuid("feed_id")
    .references(() => feeds.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const feedFollows = pgTable(
  "feed_follows",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    feedId: uuid("feed_id")
      .notNull()
      .references(() => feeds.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    userFeedUnique: uniqueIndex("user_feed_unique").on(
      table.userId,
      table.feedId
    ),
  })
);
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferSelect;
export type Post = typeof posts.$inferSelect;

