import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { miraculousCommunities } from "./miraculous.com.seed";

export async function seedGimmi() {
  await db.transaction(async (tx) => {
  const communityValues = sql.join(
    miraculousCommunities.map(({ name, slug, color, memberCount, description }) =>
      sql`(${name}, ${slug}, ${color}, ${memberCount}, ${description})`),
    sql`, `,
  );
  await tx.execute(sql`
    INSERT INTO communities (name, slug, color, member_count, description)
    VALUES ${communityValues}
    ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name, color = EXCLUDED.color, description = EXCLUDED.description
  `);
  const seededUsers = miraculousCommunities.flatMap(({ slug, users }) =>
    users.map((user) => ({ ...user, slug })));
  if (seededUsers.length > 0) {
    const userValues = sql.join(seededUsers.map(({
      displayName, username, avatar, slug, isLive, isPremium, followerCount, followingCount,
    // Parameters inside a standalone VALUES table need explicit types in PostgreSQL.
    }) => sql`(${displayName}, ${username}, ${avatar}, ${slug}, ${isLive}::boolean, ${isPremium}::boolean, ${followerCount}::integer, ${followingCount}::integer)`), sql`, `);
    await tx.execute(sql`
      INSERT INTO users (display_name, username, avatar, community_id, is_live, is_premium, follower_count, following_count)
      SELECT seed.display_name, seed.username, seed.avatar, c.id, seed.is_live, seed.is_premium, seed.follower_count, seed.following_count
      FROM (VALUES ${userValues}) AS seed(display_name, username, avatar, slug, is_live, is_premium, follower_count, following_count)
      JOIN communities c ON c.slug = seed.slug
      ON CONFLICT (username) DO NOTHING
    `);
  }
  await tx.execute(sql`
    INSERT INTO posts (author_id, type, text, caption, media_url, link, likes, comments, shares)
    SELECT u.id, 'text',
      'Courage can start with one small choice. What is one good thing you are doing for yourself or your community today?',
      '', '', 'https://gimmi.app/community/ladybug', 284, 37, 18
    FROM users u
    WHERE u.username = 'maya.c'
      AND NOT EXISTS (
        SELECT 1 FROM posts
        WHERE author_id = u.id
          AND type = 'text'
      )
  `);
  await tx.execute(sql`
    INSERT INTO posts (author_id, type, text, caption, media_url, link, likes, comments, shares)
    SELECT u.id, 'video', '',
      'A quick moment from Ladybug.', '', NULL, 196, 21, 9
    FROM users u
    WHERE u.username = 'maya.c'
      AND NOT EXISTS (
        SELECT 1 FROM posts
        WHERE author_id = u.id
          AND type = 'video'
      )
  `);
  await tx.execute(sql`
    INSERT INTO posts (author_id, type, text, caption, media_url, link, likes, comments, shares)
    SELECT u.id, seed.type, seed.text, seed.caption, seed.media_url, seed.link, seed.likes, seed.comments, seed.shares
    FROM (VALUES
      ('theo.p', 'image', '', 'A little more color for the week ahead.', 'https://images.local/gimmi-feed-saffron.png', NULL, 642, 46, 24),
      ('nia.sol', 'image', '', 'Found this light on the walk home.', 'https://images.local/gimmi-feed-blue.png', NULL, 311, 22, 12),
      ('jonbell', 'video', '', 'Live from the late shift.', '', NULL, 127, 34, 7)
    ) AS seed(username, type, text, caption, media_url, link, likes, comments, shares)
    JOIN users u ON u.username = seed.username
    WHERE NOT EXISTS (SELECT 1 FROM posts)
  `);
  await tx.execute(sql`
    UPDATE posts
    SET link = 'https://gimmi.app/quiet-hour'
    WHERE link = 'https://animus.app/quiet-hour'
  `);
  await tx.execute(sql`
    INSERT INTO community_memberships (community_id, user_id)
    SELECT u.community_id, u.id
    FROM users u
    ON CONFLICT (community_id, user_id) DO NOTHING
  `);
  await tx.execute(sql`
    INSERT INTO comments (post_id, author_id, body)
    SELECT p.id, u.id, seed.body
    FROM (VALUES
      ('theo.p', 'nia.sol', 'This is exactly the kind of quiet moment I needed.'),
      ('nia.sol', 'theo.p', 'Beautiful light — thank you for sharing it.')
    ) AS seed(post_author, comment_author, body)
    JOIN users post_user ON post_user.username = seed.post_author
    JOIN users u ON u.username = seed.comment_author
    JOIN posts p ON p.author_id = post_user.id
    WHERE NOT EXISTS (SELECT 1 FROM comments)
    LIMIT 2
  `);
  await tx.execute(sql`
    INSERT INTO messages (sender_id, recipient_id, body, status)
    SELECT sender.id, recipient.id, seed.body, seed.status
    FROM (VALUES
      ('theo.p', 'nia.sol', 'Are you going to the moss walk this weekend?', 'delivered'),
      ('nia.sol', 'theo.p', 'I saved you a spot.', 'sent')
    ) AS seed(sender_username, recipient_username, body, status)
    JOIN users sender ON sender.username = seed.sender_username
    JOIN users recipient ON recipient.username = seed.recipient_username
    WHERE NOT EXISTS (SELECT 1 FROM messages)
  `);
  await tx.execute(sql`
    INSERT INTO notifications (profile_id, kind, title, detail, read)
    SELECT u.id, seed.kind, seed.title, seed.detail, seed.read
    FROM (VALUES
      ('theo.p', 'like', 'Nia liked your post', 'A little more color for the week ahead.', false),
      ('theo.p', 'comment', 'Nia commented on your post', 'This is exactly what I needed today.', false),
      ('theo.p', 'live', 'Theo is live now', 'Bee · Studio session', true),
      ('theo.p', 'community', 'Bee has a new note', 'A new weekly prompt is ready.', true)
    ) AS seed(username, kind, title, detail, read)
    JOIN users u ON u.username = seed.username
    WHERE NOT EXISTS (SELECT 1 FROM notifications)
  `);
  });
}