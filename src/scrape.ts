import { fetchFeed } from "./rss.js";
import {
  getNextFeedToFetch,
  markFeedFetched,
} from "./lib/db/queries/feeds.js";
import { createPost } from "./lib/db/queries/posts.js";

export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds found.");
    return;
  }

  console.log(`Fetching ${feed.name}...`);

  const rssFeed = await fetchFeed(feed.url);

  await markFeedFetched(feed.id);

  for (const item of rssFeed.channel.item) {
  try {
    await createPost(
      item.title,
      item.link,
      item.description,
      new Date(item.pubDate),
      feed.id
    );

    console.log(`Saved: ${item.title}`);
  } catch (err) {
    console.log(`Skipping duplicate: ${item.title}`);
  }
}
}