import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import {
  CreatePostBody,
  CreatePostResponse,
  UploadMediaResponse,
  GetCommunityResponse,
  GetDiscoverResponse,
  GetFeedResponse,
  GetMessagesResponse,
  GetCallLogResponse,
  LogCallAttemptBody,
  LogCallAttemptResponse,
  GetNotificationsResponse,
  GetPostResponse,
  GetPostCommentsResponse,
  CreatePostCommentBody,
  CreatePostCommentResponse,
  ToggleFollowBody,
  ToggleFollowResponse,
  ToggleCommunityMembershipBody,
  ToggleCommunityMembershipResponse,
  GetConversationMessagesResponse,
  MarkNotificationsReadBody,
  MarkNotificationsReadResponse,
  GetProfileResponse,
  SendMessageBody,
  SendMessageResponse,
  TogglePostLikeBody,
  TogglePostLikeResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import { uploadMedia } from "../middlewares/upload";

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

function validId(value: unknown, fallback = 1): number {
  const parsed = numberParam(value, fallback);
  if (parsed < 1) throw new Error("ID must be a positive integer");
  return parsed;
}

function validHttpUrl(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^https?:\/\/[^\s]+$/i.test(value)) {
    throw new Error("Link must be a valid HTTP(S) URL");
  }
  return value;
}

function toMessage(row: Row) {
  return {
    id: asNumber(row.id),
    senderId: asNumber(row.sender_id),
    recipientId: asNumber(row.recipient_id),
    body: asString(row.body),
    createdAt: new Date(String(row.created_at)).toISOString(),
    status: asString(row.status) as "sent" | "delivered" | "read",
  };
}

function toCallAttempt(row: Row) {
  return {
    id: asNumber(row.attempt_id),
    recipient: toAuthor(row),
    type: asString(row.type) as "voice" | "video",
    startedAt: new Date(String(row.started_at)).toISOString(),
  };
}

function toComment(row: Row) {
  return {
    id: asNumber(row.comment_id ?? row.id),
    postId: asNumber(row.post_id),
    author: toAuthor(row),
    body: asString(row.body),
    createdAt: new Date(String(row.created_at)).toISOString(),
    parentCommentId: row.parent_comment_id == null ? null : asNumber(row.parent_comment_id),
  };
}

const commentSelect = sql`
  SELECT cm.id AS comment_id, cm.post_id, cm.parent_comment_id, cm.body, cm.created_at,
         u.id AS author_id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
         c.name AS community_name, c.color AS community_color
  FROM comments cm
  JOIN users u ON u.id = cm.author_id
  JOIN communities c ON c.id = u.community_id
`;

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
  const requestedViewerId = numberParam(req.query.viewerId, 1);
  try {
    const viewerResult = await db.execute(sql`
      SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
             c.name AS community_name, c.color AS community_color
      FROM users u JOIN communities c ON c.id = u.community_id
      ORDER BY
        CASE
          WHEN u.id = ${requestedViewerId} THEN 0
          WHEN c.slug = 'ladybug' THEN 1
          ELSE 2
        END,
        u.id
      LIMIT 1
    `);
    const viewerRow = (viewerResult.rows as Row[])[0];
    const viewerId = asNumber(viewerRow?.id);
    const postResult = await db.execute(sql`${postSelect(viewerId)} ORDER BY p.created_at DESC LIMIT 20`);
    const data = GetFeedResponse.parse({
      posts: (postResult.rows as Row[]).map((row) => toPost(row, viewerId)),
      viewer: toAuthor(viewerRow ?? {}),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load Gimmi feed");
    res.status(500).json({ message: "Unable to load the feed" });
  }
});

router.get("/posts/:postId", async (req, res) => {
  const postId = validId(req.params.postId, 0);
  const viewerId = validId(req.query.viewerId, 1);
  try {
    const result = await db.execute(sql`${postSelect(viewerId)} WHERE p.id = ${postId}`);
    const row = (result.rows as Row[])[0];
    if (!row) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.json(GetPostResponse.parse(toPost(row, viewerId)));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load post");
    res.status(400).json({ message: "Unable to load post" });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  const postId = validId(req.params.postId, 0);
  try {
    const result = await db.execute(sql`${commentSelect} WHERE cm.post_id = ${postId} ORDER BY cm.created_at ASC`);
    res.json(GetPostCommentsResponse.parse({
      comments: (result.rows as Row[]).map(toComment),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load comments");
    res.status(400).json({ message: "Unable to load comments" });
  }
});

router.post("/posts/:postId/comments", async (req, res) => {
  const postId = validId(req.params.postId, 0);
  try {
    const body = CreatePostCommentBody.parse(req.body);
    const parentCommentId = body.parentCommentId ?? null;
    const row = await db.transaction(async (tx) => {
      const post = await tx.execute(sql`SELECT id, author_id FROM posts WHERE id = ${postId}`);
      if (!post.rows.length) throw new Error("Post not found");
      const author = await tx.execute(sql`SELECT id FROM users WHERE id = ${body.authorId}`);
      if (!author.rows.length) throw new Error("Author not found");
      if (parentCommentId !== null) {
        const parent = await tx.execute(sql`
          SELECT id FROM comments WHERE id = ${parentCommentId} AND post_id = ${postId}
        `);
        if (!parent.rows.length) throw new Error("Parent comment not found");
      }
      const inserted = await tx.execute(sql`
        INSERT INTO comments (post_id, author_id, parent_comment_id, body)
        VALUES (${postId}, ${body.authorId}, ${parentCommentId}, ${body.body})
        RETURNING id, post_id, author_id, parent_comment_id, body, created_at
      `);
      await tx.execute(sql`UPDATE posts SET comments = comments + 1 WHERE id = ${postId}`);
      const postOwnerId = asNumber((post.rows as Row[])[0]?.author_id);
      if (postOwnerId !== body.authorId) {
        await tx.execute(sql`
          INSERT INTO notifications (profile_id, kind, title, detail, read)
          VALUES (${postOwnerId}, 'comment', 'New comment', ${body.body}, false)
        `);
      }
      const comment = (inserted.rows as Row[])[0] ?? {};
      const enriched = await tx.execute(sql`${commentSelect} WHERE cm.id = ${asNumber(comment.id)}`);
      return (enriched.rows as Row[])[0] ?? {};
    });
    res.status(201).json(CreatePostCommentResponse.parse(toComment(row)));
  } catch (error) {
    req.log.error({ err: error }, "Failed to create comment");
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to create comment" });
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
        ORDER BY
          CASE slug
            WHEN 'ladybug' THEN 0
            WHEN 'cat' THEN 1
            ELSE 2
          END,
          name ASC
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
  const viewerId = numberParam(req.query.viewerId, 1);
  try {
    const [communityResult, membersResult, postResult, membershipResult] = await Promise.all([
      db.execute(sql`SELECT id, name, slug, color, member_count, description FROM communities WHERE id = ${communityId}`),
      db.execute(sql`
        SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
               c.name AS community_name, c.color AS community_color
        FROM users u JOIN communities c ON c.id = u.community_id
        WHERE u.community_id = ${communityId}
        ORDER BY u.follower_count DESC LIMIT 20
      `),
      db.execute(sql`
        ${postSelect(viewerId)}
        WHERE u.community_id = ${communityId}
        ORDER BY p.created_at DESC LIMIT 20
      `),
      db.execute(sql`
        SELECT 1 FROM community_memberships
        WHERE community_id = ${communityId} AND user_id = ${viewerId}
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
       joinedByViewer: membershipResult.rows.length > 0,
       posts: (postResult.rows as Row[]).map((row) => toPost(row, viewerId)),
    });
    res.json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load community");
    res.status(500).json({ message: "Unable to load community" });
  }
});

router.post("/communities/:communityId/membership", async (req, res) => {
  const communityId = validId(req.params.communityId, 0);
  try {
    const body = ToggleCommunityMembershipBody.parse(req.body);
    const result = await db.transaction(async (tx) => {
      const community = await tx.execute(sql`SELECT id FROM communities WHERE id = ${communityId}`);
      const user = await tx.execute(sql`SELECT id FROM users WHERE id = ${body.viewerId}`);
      if (!community.rows.length) throw new Error("Community not found");
      if (!user.rows.length) throw new Error("Viewer not found");
      const inserted = await tx.execute(sql`
        INSERT INTO community_memberships (community_id, user_id)
        VALUES (${communityId}, ${body.viewerId})
        ON CONFLICT (community_id, user_id) DO NOTHING
        RETURNING id
      `);
      const joined = inserted.rows.length > 0;
      if (joined) {
        await tx.execute(sql`UPDATE communities SET member_count = member_count + 1 WHERE id = ${communityId}`);
      } else {
        const removed = await tx.execute(sql`
          DELETE FROM community_memberships
          WHERE community_id = ${communityId} AND user_id = ${body.viewerId}
          RETURNING id
        `);
        if (removed.rows.length > 0) {
          await tx.execute(sql`
            UPDATE communities SET member_count = GREATEST(member_count - 1, 0)
            WHERE id = ${communityId}
          `);
        }
      }
      const count = await tx.execute(sql`SELECT member_count FROM communities WHERE id = ${communityId}`);
      return { joined, memberCount: asNumber((count.rows as Row[])[0]?.member_count) };
    });
    res.json(ToggleCommunityMembershipResponse.parse(result));
  } catch (error) {
    req.log.error({ err: error }, "Failed to update community membership");
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to update membership" });
  }
});

router.post("/upload", uploadMedia.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const publicBase = `${req.protocol}://${req.get("host")}`;
    const url = `${publicBase}/uploads/${req.file.filename}`;
    const data = UploadMediaResponse.parse({ url });
    res.status(201).json(data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to upload media");
    res.status(400).json({ message: "Unable to upload file" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const body = CreatePostBody.parse(req.body);
    if (body.type === "text" && (!body.text || body.text.length > 500)) {
      throw new Error("Text posts must contain between 1 and 500 characters");
    }
    const link = validHttpUrl(body.link);
    const insertResult = await db.execute(sql`
      INSERT INTO posts (author_id, type, text, caption, media_url, link)
      VALUES (${body.authorId}, ${body.type}, ${body.text ?? ""}, ${body.caption ?? ""}, ${body.mediaUrl ?? ""}, ${link})
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

router.get("/call-log", async (req, res) => {
  const viewerId = numberParam(req.query.viewerId, 1);
  try {
    const result = await db.execute(sql`
      SELECT a.id AS attempt_id, a.type, a.started_at,
        person.id, person.display_name, person.username, person.avatar,
        person.is_live, person.is_premium,
        c.name AS community_name, c.color AS community_color
      FROM call_attempts a
      JOIN users person ON person.id = a.recipient_id
      JOIN communities c ON c.id = person.community_id
      WHERE a.viewer_id = ${viewerId}
      ORDER BY a.started_at DESC, a.id DESC
      LIMIT 50
    `);
    res.json(GetCallLogResponse.parse({
      attempts: (result.rows as Row[]).map(toCallAttempt),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load call log");
    res.status(500).json({ message: "Unable to load call log" });
  }
});

router.post("/call-log", async (req, res) => {
  try {
    const body = LogCallAttemptBody.parse(req.body);
    if (body.viewerId === body.recipientId || body.viewerId < 1 || body.recipientId < 1) {
      res.status(400).json({ message: "A call preview requires a different person" });
      return;
    }
    const result = await db.execute(sql`
      WITH added AS (
        INSERT INTO call_attempts (viewer_id, recipient_id, type)
        VALUES (${body.viewerId}, ${body.recipientId}, ${body.type})
        RETURNING id, recipient_id, type, started_at
      )
      SELECT a.id AS attempt_id, a.type, a.started_at,
        person.id, person.display_name, person.username, person.avatar,
        person.is_live, person.is_premium,
        c.name AS community_name, c.color AS community_color
      FROM added a
      JOIN users person ON person.id = a.recipient_id
      JOIN communities c ON c.id = person.community_id
    `);
    res.status(201).json(LogCallAttemptResponse.parse(toCallAttempt((result.rows as Row[])[0] ?? {})));
  } catch (error) {
    req.log.error({ err: error }, "Failed to log call preview");
    res.status(400).json({ message: "Unable to start call preview" });
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

router.get("/conversations/:conversationId/messages", async (req, res) => {
  const conversationId = validId(req.params.conversationId, 0);
  const viewerId = validId(req.query.viewerId, 1);
  try {
    const result = await db.execute(sql`
      SELECT id, sender_id, recipient_id, body, created_at, status
      FROM messages
      WHERE ((sender_id = ${viewerId} AND recipient_id = ${conversationId})
        OR (sender_id = ${conversationId} AND recipient_id = ${viewerId}))
      ORDER BY created_at ASC, id ASC
      LIMIT 100
    `);
    res.json(GetConversationMessagesResponse.parse({
      messages: (result.rows as Row[]).map(toMessage),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load conversation history");
    res.status(400).json({ message: "Unable to load conversation history" });
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

router.post("/profiles/:profileId/follow", async (req, res) => {
  const profileId = validId(req.params.profileId, 0);
  try {
    const body = ToggleFollowBody.parse(req.body);
    if (body.viewerId === profileId) {
      throw new Error("You cannot follow your own profile");
    }
    const result = await db.transaction(async (tx) => {
      const profiles = await tx.execute(sql`
        SELECT id FROM users WHERE id IN (${body.viewerId}, ${profileId})
      `);
      if (profiles.rows.length !== 2) throw new Error("Profile not found");
      const inserted = await tx.execute(sql`
        INSERT INTO followers (follower_id, followed_id)
        VALUES (${body.viewerId}, ${profileId})
        ON CONFLICT (follower_id, followed_id) DO NOTHING
        RETURNING id
      `);
      const following = inserted.rows.length > 0;
      if (following) {
        await tx.execute(sql`UPDATE users SET follower_count = follower_count + 1 WHERE id = ${profileId}`);
        await tx.execute(sql`UPDATE users SET following_count = following_count + 1 WHERE id = ${body.viewerId}`);
        await tx.execute(sql`
          INSERT INTO notifications (profile_id, kind, title, detail, read)
          VALUES (${profileId}, 'follow', 'New follower', 'Someone started following you.', false)
        `);
      } else {
        const removed = await tx.execute(sql`
          DELETE FROM followers
          WHERE follower_id = ${body.viewerId} AND followed_id = ${profileId}
          RETURNING id
        `);
        if (removed.rows.length > 0) {
          await tx.execute(sql`UPDATE users SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = ${profileId}`);
          await tx.execute(sql`UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = ${body.viewerId}`);
        }
      }
      const count = await tx.execute(sql`SELECT follower_count FROM users WHERE id = ${profileId}`);
      return { following, followerCount: asNumber((count.rows as Row[])[0]?.follower_count) };
    });
    res.json(ToggleFollowResponse.parse(result));
  } catch (error) {
    req.log.error({ err: error }, "Failed to update follow state");
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to update follow state" });
  }
});

router.get("/profiles/:profileId", async (req, res) => {
  const profileId = numberParam(req.params.profileId, 1);
  const viewerId = numberParam(req.query.viewerId, 1);
  try {
    const [userResult, postResult] = await Promise.all([
      db.execute(sql`
        SELECT u.id, u.display_name, u.username, u.avatar, u.is_live, u.is_premium,
               u.follower_count, u.following_count, c.name AS community_name, c.color AS community_color,
               EXISTS(
                 SELECT 1 FROM followers f WHERE f.follower_id = ${viewerId} AND f.followed_id = u.id
               ) AS followed_by_viewer
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
      followedByViewer: asBoolean(userRow.followed_by_viewer),
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

router.post("/profiles/:profileId/notifications/read", async (req, res) => {
  const profileId = validId(req.params.profileId, 0);
  try {
    const body = MarkNotificationsReadBody.parse(req.body ?? {});
    const result = body.notificationId == null
      ? await db.execute(sql`
          UPDATE notifications SET read = true
          WHERE profile_id = ${profileId} AND read = false
        `)
      : await db.execute(sql`
          UPDATE notifications SET read = true
          WHERE profile_id = ${profileId} AND id = ${body.notificationId} AND read = false
        `);
    res.json(MarkNotificationsReadResponse.parse({ updated: result.rowCount ?? 0 }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to mark notifications as read");
    res.status(400).json({ message: "Unable to mark notifications as read" });
  }
});

export default router;