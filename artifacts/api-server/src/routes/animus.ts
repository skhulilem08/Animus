import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import {
  CreatePostBody,
  CreatePostResponse,
  GetCommunityResponse,
  GetDiscoverResponse,
  GetFeedResponse,
  GetMessagesResponse,
  GetNotificationsResponse,
  GetProfileResponse,
  SendMessageBody,
  SendMessageResponse,
  TogglePostLikeBody,
  TogglePostLikeResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";

const router: IRouter = Router();
type Row = Record<string, unknown>;

function numberParam(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

function toAuthor(row: Row) {
  return {
    id: asNumber(row.author_id ?? row.id),
    displayName: asString(row.display_name),
    username: asString(row.username),
    avatar: asString(row.avatar),
    communityName: asString(row.community_name),
    communityColor: asString(row.community_color),
    isLive: asBoolean(row.is_live),
    isPremium: asBoolean(row.is_premium),
  };
}

function toPost(row: Row, viewerId: number) {
  return {
    id: asNumber(row.post_id ?? row.id),
    author: toAuthor(row),
    type: asString(row.type) as "text" | "image" | "video",
    text: asString(row.text),
    caption: asString(row.caption),
    mediaUrl: asString(row.media_url),
    link: row.link == null ? null : asString(row.link),
    createdAt: new Date(String(row.created_at)).toISOString(),
    likes: asNumber(row.likes),
    comments: asNumber(row.comments),
    shares: asNumber(row.shares),
    likedByViewer: asBoolean(row.viewer_like ?? row.liked_by_viewer),
  };
}

const postSelect = (viewerId: number) => sql`
  SELECT
    p.id AS post_id, p.type, p.text, p.caption, p.media_url, p.link,
    p.created_at, p.likes, p.comments, p.shares,
    u.id AS author_id, u.display_name, u.username, u.avatar,
    u.is_live, u.is_premium,
    c.name AS community_name, c.color AS community_color,
    EXISTS (
      SELECT 1 FROM likes viewer_likes
      WHERE viewer_likes.post_id = p.id AND viewer_likes.user_id = ${viewerId}
    ) AS viewer_like
  FROM posts p
  JOIN users u ON u.id = p.author_id
  JOIN communities c ON c.id = u.community_id
`;

router.get("/feed", async (req, res) => {
  const viewerId = numberParam(req.query.viewerId, 1);
  try {
    const [postResult, viewerResult] = await Promise.all([
      db.execute(sql`${postSelect(viewerId)} ORDER BY p.created_at DESC LIMIT 20`),
      db.execute(sql`
        SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
               c.name AS community_name, c.color AS community_color
        FROM users u JOIN communities c ON c.id = u.community_id
        WHERE u.id = ${viewerId}
      `),
    ]);
    const viewerRow = (viewerResult.rows as Row[])[0];
    const data = GetFeedResponse.parse({
      posts: (postResult.rows as Row[]).map((row) => toPost(row, viewerId)),
      viewer: toAuthor(viewerRow ?? {}),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load Animus feed");
    res.status(500).json({ message: "Unable to load the feed" });
  }
});

router.get("/discover", async (req, res) => {
  const query = asString(req.query.query).trim();
  const pattern = `%${query}%`;
  try {
    const [communityResult, peopleResult] = await Promise.all([
      db.execute(sql`
        SELECT id, name, slug, color, member_count, description
        FROM communities
        WHERE ${query ? sql`name ILIKE ${pattern} OR description ILIKE ${pattern}` : sql`TRUE`}
        ORDER BY member_count DESC
        LIMIT 12
      `),
      db.execute(sql`
        SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
               c.name AS community_name, c.color AS community_color
        FROM users u JOIN communities c ON c.id = u.community_id
        WHERE ${query ? sql`u.display_name ILIKE ${pattern} OR u.username ILIKE ${pattern}` : sql`TRUE`}
        ORDER BY u.follower_count DESC
        LIMIT 12
      `),
    ]);
    const data = GetDiscoverResponse.parse({
      communities: (communityResult.rows as Row[]).map((row) => ({
        id: asNumber(row.id),
        name: asString(row.name),
        slug: asString(row.slug),
        color: asString(row.color),
        memberCount: asNumber(row.member_count),
        description: asString(row.description),
      })),
      people: (peopleResult.rows as Row[]).map(toAuthor),
      topics: ["quiet mornings", "street photography", "makers", "live music", "small rituals"],
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load discovery");
    res.status(500).json({ message: "Unable to load discovery" });
  }
});

router.get("/communities/:communityId", async (req, res) => {
  const communityId = numberParam(req.params.communityId, 1);
  try {
    const [communityResult, membersResult, postResult] = await Promise.all([
      db.execute(sql`SELECT id, name, slug, color, member_count, description FROM communities WHERE id = ${communityId}`),
      db.execute(sql`
        SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
               c.name AS community_name, c.color AS community_color
        FROM users u JOIN communities c ON c.id = u.community_id
        WHERE u.community_id = ${communityId}
        ORDER BY u.follower_count DESC LIMIT 20
      `),
      db.execute(sql`
        ${postSelect(1)}
        WHERE u.community_id = ${communityId}
        ORDER BY p.created_at DESC LIMIT 20
      `),
    ]);
    const communityRow = (communityResult.rows as Row[])[0];
    if (!communityRow) {
      res.status(404).json({ message: "Community not found" });
      return;
    }
    const data = GetCommunityResponse.parse({
      community: {
        id: asNumber(communityRow.id),
        name: asString(communityRow.name),
        slug: asString(communityRow.slug),
        color: asString(communityRow.color),
        memberCount: asNumber(communityRow.member_count),
        description: asString(communityRow.description),
      },
      members: (membersResult.rows as Row[]).map(toAuthor),
      posts: (postResult.rows as Row[]).map((row) => toPost(row, 1)),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load community");
    res.status(500).json({ message: "Unable to load community" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const body = CreatePostBody.parse(req.body);
    const insertResult = await db.execute(sql`
      INSERT INTO posts (author_id, type, text, caption, media_url, link)
      VALUES (${body.authorId}, ${body.type}, ${body.text ?? ""}, ${body.caption ?? ""}, ${body.mediaUrl ?? ""}, ${body.link ?? null})
      RETURNING id
    `);
    const postId = asNumber((insertResult.rows as Row[])[0]?.id);
    const postResult = await db.execute(sql`${postSelect(body.authorId)} WHERE p.id = ${postId}`);
    const data = CreatePostResponse.parse(toPost((postResult.rows as Row[])[0] ?? {}, body.authorId));
    res.status(201).json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to create post");
    res.status(400).json({ message: "Unable to create post" });
  }
});

router.post("/posts/:postId/like", async (req, res) => {
  try {
    const postId = numberParam(req.params.postId, 0);
    const body = TogglePostLikeBody.parse(req.body);
    const result = await db.transaction(async (tx) => {
      const inserted = await tx.execute(sql`
        INSERT INTO likes (post_id, user_id)
        VALUES (${postId}, ${body.viewerId})
        ON CONFLICT (post_id, user_id) DO NOTHING
        RETURNING id
      `);
      const liked = inserted.rows.length > 0;

      if (liked) {
        await tx.execute(sql`UPDATE posts SET likes = likes + 1 WHERE id = ${postId}`);
      } else {
        const removed = await tx.execute(sql`
          DELETE FROM likes
          WHERE post_id = ${postId} AND user_id = ${body.viewerId}
          RETURNING id
        `);
        if (removed.rows.length > 0) {
          await tx.execute(sql`UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = ${postId}`);
        }
      }

      const countResult = await tx.execute(sql`SELECT likes FROM posts WHERE id = ${postId}`);
      return {
        liked,
        likes: asNumber((countResult.rows as Row[])[0]?.likes),
      };
    });
    res.json(TogglePostLikeResponse.parse(result));
  } catch (error) {
    req.log.error({ err: error }, "Failed to toggle post like");
    res.status(400).json({ message: "Unable to update like" });
  }
});

router.get("/messages", async (req, res) => {
  const viewerId = numberParam(req.query.viewerId, 1);
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT ON (person.id)
        person.id, person.display_name, person.username, person.avatar,
        person.is_live, person.is_premium, c.name AS community_name, c.color AS community_color,
        m.body AS last_message, m.created_at AS updated_at, 0 AS unread_count
      FROM messages m
      JOIN users person ON person.id = CASE WHEN m.sender_id = ${viewerId} THEN m.recipient_id ELSE m.sender_id END
      JOIN communities c ON c.id = person.community_id
      WHERE m.sender_id = ${viewerId} OR m.recipient_id = ${viewerId}
      ORDER BY person.id, m.created_at DESC
    `);
    const data = GetMessagesResponse.parse({
      conversations: (result.rows as Row[]).map((row) => ({
        id: asNumber(row.id),
        person: toAuthor(row),
        lastMessage: asString(row.last_message),
        unreadCount: asNumber(row.unread_count),
        updatedAt: new Date(String(row.updated_at)).toISOString(),
      })),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load messages");
    res.status(500).json({ message: "Unable to load messages" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const body = SendMessageBody.parse(req.body);
    const row = await db.transaction(async (tx) => {
      const result = await tx.execute(sql`
        INSERT INTO messages (sender_id, recipient_id, body, status)
        VALUES (${body.senderId}, ${body.recipientId}, ${body.body}, 'sent')
        RETURNING id, sender_id, recipient_id, body, created_at, status
      `);
      await tx.execute(sql`
        INSERT INTO notifications (profile_id, kind, title, detail, read)
        VALUES (${body.recipientId}, 'message', 'New message', ${body.body}, false)
      `);
      return (result.rows as Row[])[0] ?? {};
    });
    const data = SendMessageResponse.parse({
      id: asNumber(row.id),
      senderId: asNumber(row.sender_id),
      recipientId: asNumber(row.recipient_id),
      body: asString(row.body),
      createdAt: new Date(String(row.created_at)).toISOString(),
      status: asString(row.status) as "sent" | "delivered" | "read",
    });
    res.status(201).json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to send message");
    res.status(400).json({ message: "Unable to send message" });
  }
});

router.get("/profiles/:profileId", async (req, res) => {
  const profileId = numberParam(req.params.profileId, 1);
  try {
    const [userResult, postResult] = await Promise.all([
      db.execute(sql`
        SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
               u.follower_count, u.following_count, c.name AS community_name, c.color AS community_color
        FROM users u JOIN communities c ON c.id = u.community_id WHERE u.id = ${profileId}
      `),
      db.execute(sql`${postSelect(profileId)} WHERE p.author_id = ${profileId} ORDER BY p.created_at DESC LIMIT 30`),
    ]);
    const userRow = (userResult.rows as Row[])[0];
    if (!userRow) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    const data = GetProfileResponse.parse({
      user: toAuthor(userRow),
      followerCount: asNumber(userRow.follower_count),
      followingCount: asNumber(userRow.following_count),
      posts: (postResult.rows as Row[]).map((row) => toPost(row, profileId)),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load profile");
    res.status(500).json({ message: "Unable to load profile" });
  }
});

router.get("/profiles/:profileId/notifications", async (req, res) => {
  const profileId = numberParam(req.params.profileId, 1);
  try {
    const result = await db.execute(sql`
      SELECT id, kind, title, detail, created_at, read
      FROM notifications WHERE profile_id = ${profileId}
      ORDER BY created_at DESC LIMIT 30
    `);
    const data = GetNotificationsResponse.parse({
      notifications: (result.rows as Row[]).map((row) => ({
        id: asNumber(row.id),
        kind: asString(row.kind) as "like" | "comment" | "follow" | "live" | "message" | "community",
        title: asString(row.title),
        detail: asString(row.detail),
        createdAt: new Date(String(row.created_at)).toISOString(),
        read: asBoolean(row.read),
      })),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load notifications");
    res.status(500).json({ message: "Unable to load notifications" });
  }
});

export default router;