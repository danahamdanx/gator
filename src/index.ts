import {createUser,getUserByName,getUsers,deleteUsers} from "./lib/db/queries/users.js";
import { setUser, readConfig } from "./config.js";
import { fetchFeed } from "./rss.js";
import { createFeed, getFeeds, getFeedByURL,  } from "./lib/db/queries/feeds.js";
import type { Feed, User } from "./lib/db/schema.js";
import {createFeedFollow, getFeedFollowsForUser,deleteFeedFollow} from "./lib/db/queries/feedFollows.js";
import { scrapeFeeds } from "./scrape.js";
import { getPostsForUser } from "./lib/db/queries/posts.js";

function parseDuration(
  durationStr: string
): number {

  const regex = /^(\d+)(ms|s|m|h)$/;

  const match = durationStr.match(regex);

  if (!match) {
    throw new Error("Invalid duration");
  }

  const value = Number(match[1]);

  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;

    case "s":
      return value * 1000;

    case "m":
      return value * 60 * 1000;

    case "h":
      return value * 60 * 60 * 1000;

    default:
      throw new Error("Invalid duration");
  }
}

function printFeed(feed: Feed, user: User) {
  console.log("Feed:");
  console.log(`  ID: ${feed.id}`);
  console.log(`  Name: ${feed.name}`);
  console.log(`  URL: ${feed.url}`);
  console.log(`  User: ${user.name}`);
}

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {

  return async (
    cmdName: string,
    ...args: string[]
  ): Promise<void> => {

    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("No current user");
    }

    const user = await getUserByName(
      config.currentUserName
    );

    if (!user) {
      throw new Error("User not found");
    }

    await handler(
      cmdName,
      user,
      ...args
    );
  };
}

async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  if (args.length === 0) {
    throw new Error("username is required");
  }

  const username = args[0];

  const user = await getUserByName(username);

  if (!user) {
    throw new Error("User does not exist");
  }

  setUser(username);

  console.log(`Logged in as ${username}`);
}

async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  if (args.length === 0) {
    throw new Error("username is required");
  }

  const username = args[0];


  const existingUser = await getUserByName(username);

  if (existingUser) {
    throw new Error("User already exists");
  }


  const user = await createUser(username);


  setUser(username);


  console.log(`User ${username} created successfully`);

  console.log(user);
}

async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  const users = await getUsers();
  const config = readConfig();

  for (const user of users) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  await deleteUsers();

  console.log("Database reset.");
}


async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  if (args.length === 0) {
    throw new Error(
      "usage: agg <time_between_reqs>"
    );
  }

  const timeBetweenRequests = parseDuration(
    args[0]
  );

  console.log(
    `Collecting feeds every ${args[0]}`
  );

  await scrapeFeeds();

  const interval = setInterval(() => {
    scrapeFeeds().catch(console.error);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log(
        "Shutting down feed aggregator..."
      );

      clearInterval(interval);

      resolve();
    });
  });
}

async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  if (args.length < 2) {
    throw new Error("usage: addfeed <name> <url>");
  }

  const [name, url] = args;

  const feed = await createFeed(
    name,
    url,
    user.id
  );
const follow = await createFeedFollow(
  user.id,
  feed.id
);
 printFeed(feed, user);

console.log(
  `${follow.userName} is following ${follow.feedName}`
);
}

async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feeds = await getFeeds();

  for (const feed of feeds) {
    console.log(`Name: ${feed.feedName}`);
    console.log(`URL: ${feed.feedUrl}`);
    console.log(`User: ${feed.userName}`);
    console.log();
  }
}

async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  if (args.length === 0) {
    throw new Error("feed url is required");
  }

  const url = args[0];

  const feed = await getFeedByURL(url);

  if (!feed) {
    throw new Error("Feed not found");
  }

  const follow = await createFeedFollow(
    user.id,
    feed.id
  );

  console.log(
    `${follow.userName} is following ${follow.feedName}`
  );
}

async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  const follows = await getFeedFollowsForUser(
    user.id
  );

  for (const follow of follows) {
    console.log(
      `* ${follow.feedName}`
    );
  }
}

async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  if (args.length === 0) {
    throw new Error("feed url is required");
  }

  const url = args[0];

  const feed = await getFeedByURL(url);

  if (!feed) {
    throw new Error("Feed not found");
  }

  const deleted = await deleteFeedFollow(
    user.id,
    feed.id
  );

  if (!deleted) {
    throw new Error(
      "You are not following this feed"
    );
  }

  console.log(
    `Unfollowed ${feed.name}`
  );
}

async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  let limit = 2;

  if (args.length > 0) {
    limit = parseInt(args[0]);
  }

  const posts = await getPostsForUser(
    user.id,
    limit
  );

  for (const post of posts) {
    console.log(`Title: ${post.title}`);
    console.log(`URL: ${post.url}`);
    console.log(`Published: ${post.publishedAt}`);
    console.log();
  }
}


function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}


async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}



async function main() {
  const registry: CommandsRegistry = {};

  registerCommand(
    registry,
    "login",
    handlerLogin
  );

  registerCommand(
    registry,
    "register",
    handlerRegister
  );

  registerCommand(
  registry,
  "users",
  handlerUsers
);

registerCommand(
  registry,
  "reset",
  handlerReset
);

registerCommand(
  registry,
  "agg",
  handlerAgg
);

registerCommand(
  registry,
  "addfeed",
  middlewareLoggedIn(handlerAddFeed)
);

registerCommand(
  registry,
  "feeds",
  handlerFeeds
);

registerCommand(
  registry,
  "follow",
  middlewareLoggedIn(handlerFollow)
);

registerCommand(
  registry,
  "following",
  middlewareLoggedIn(handlerFollowing)
);

registerCommand(
  registry,
  "unfollow",
  middlewareLoggedIn(handlerUnfollow)
);

registerCommand(
  registry,
  "browse",
  middlewareLoggedIn(handlerBrowse)
);
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("No command provided");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;

  await runCommand(
    registry,
    cmdName,
    ...cmdArgs
  );

  process.exit(0);
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});