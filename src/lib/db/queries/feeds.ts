import { db } from "..";
import { feeds, users } from "../schema";
import { eq, asc, sql } from "drizzle-orm";

export async function createFeed(
  name: string,
  url: string,
  userId: string
) {
  const [feed] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return feed;
}


export async function getFeeds() {
  return await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}

export async function getFeedByURL(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}

export async function markFeedFetched(
  id: string
) {
  const [feed] = await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, id))
    .returning();

  return feed;
}

export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(
      sql`${feeds.lastFetchedAt} NULLS FIRST`,
      asc(feeds.lastFetchedAt)
    )
    .limit(1);

  return feed;
}