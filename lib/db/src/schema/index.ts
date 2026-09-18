import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const communitiesTable = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  color: varchar("color", { length: 20 }).notNull(),
  memberCount: integer("member_count").notNull().default(0),
  description: text("description").notNull(),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  username: varchar("username", { length: 40 }).notNull().unique(),
  avatar: text("avatar").notNull().default(""),
  communityId: integer("community_id")
    .notNull()
    .references(() => communitiesTable.id),
  isLive: boolean("is_live").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  followerCount: integer("follower_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
});

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id")
    .notNull()
    .references(() => usersTable.id),
  type: varchar("type", { length: 12 }).notNull(),
  text: text("text").notNull().default(""),
  caption: text("caption").notNull().default(""),
  mediaUrl: text("media_url").notNull().default(""),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
});

export const likesTable = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => postsTable.id),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => ({
    postUserUnique: unique().on(table.postId, table.userId),
  }),
);

export const followersTable = pgTable(
  "followers",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id")
      .notNull()
      .references(() => usersTable.id),
    followedId: integer("followed_id")
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => ({
    followerUnique: unique().on(table.followerId, table.followedId),
  }),
);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => usersTable.id),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => usersTable.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: varchar("status", { length: 12 }).notNull().default("sent"),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => usersTable.id),
  kind: varchar("kind", { length: 16 }).notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  read: boolean("read").notNull().default(false),
});