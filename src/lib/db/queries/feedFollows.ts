import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { and, eq } from "drizzle-orm";

export async function createFeedFollow(
  userId: string,
  feedId: string
) {
  const [newFollow] = await db
    .insert(feedFollows)
    .values({
      userId,
      feedId,
    })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(
      users,
      eq(feedFollows.userId, users.id)
    )
    .innerJoin(
      feeds,
      eq(feedFollows.feedId, feeds.id)
    )
    .where(eq(feedFollows.id, newFollow.id));

  return result;
}

export async function getFeedFollowsForUser(
  userId: string
) {
  return await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(
      users,
      eq(feedFollows.userId, users.id)
    )
    .innerJoin(
      feeds,
      eq(feedFollows.feedId, feeds.id)
    )
    .where(eq(feedFollows.userId, userId));
}

export async function deleteFeedFollow(
  userId: string,
  feedId: string
) {
  const [deleted] = await db
    .delete(feedFollows)
    .where(
      and(
        eq(feedFollows.userId, userId),
        eq(feedFollows.feedId, feedId)
      )
    )
    .returning();

  return deleted;
}