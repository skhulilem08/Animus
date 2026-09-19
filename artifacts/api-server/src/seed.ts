import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

export async function seedGimmi() {
  await db.transaction(async (tx) => {
  // Development correction: remove the retired Blue Hour fixture and every
  // dependent record so rerunning the seed cannot leave it discoverable.
  await tx.execute(sql`
    DELETE FROM comments
    WHERE author_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
       OR post_id IN (SELECT p.id FROM posts p JOIN users u ON u.id = p.author_id
                      WHERE u.community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM likes
    WHERE user_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
       OR post_id IN (SELECT p.id FROM posts p JOIN users u ON u.id = p.author_id
                      WHERE u.community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM notifications
    WHERE profile_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM messages
    WHERE sender_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
       OR recipient_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM followers
    WHERE follower_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
       OR followed_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM community_memberships
    WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour')
       OR user_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM posts
    WHERE author_id IN (SELECT id FROM users WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour'))
  `);
  await tx.execute(sql`
    DELETE FROM users
    WHERE community_id = (SELECT id FROM communities WHERE slug = 'blue-hour')
  `);
  await tx.execute(sql`DELETE FROM communities WHERE slug = 'blue-hour'`);
  await tx.execute(sql`
    INSERT INTO communities (name, slug, color, member_count, description) VALUES
      ('Saffron Club', 'saffron-club', '#D78A24', 9420, 'Make something small. Make it with care.'),
      ('Moss & Stone', 'moss-and-stone', '#6B8068', 7310, 'A slower corner for field notes and outdoor rituals.'),
      ('Night Shift', 'night-shift', '#7656B8', 5180, 'For people who come alive after the city goes quiet.'),
      ('Ladybug Community', 'ladybug', '#FF3B30', 12600, 'Small details, bright spots, and a little courage.'),
      ('Turtle', 'turtle', '#34C759', 8940, 'Move gently, notice more, and make space to grow.'),
      ('Cat Community', 'cat', '#18251E', 7820, 'Independent minds, quiet rooms, and curious nights.'),
      ('Dragon', 'dragon', '#FF453A', 11200, 'Big ideas, brave experiments, and unapologetic energy.'),
      ('Fox', 'fox', '#FF9500', 9650, 'Clever projects, warm conversations, and good instincts.'),
      ('Pig', 'pig', '#FF2D55', 6240, 'Kind people, soft landings, and honest joy.'),
      ('Horse', 'horse', '#8E5A3C', 7130, 'Open roads, steady practice, and grounded stories.'),
      ('Ox', 'ox', '#007AFF', 10800, 'Patient work, clear thinking, and dependable community.'),
      ('Tiger', 'tiger', '#AF52DE', 8840, 'Creative force, vivid expression, and fearless curiosity.'),
      ('Snake', 'snake', '#14B8A6', 5370, 'Change, craft, and a calmer way to begin again.'),
      ('Rooster', 'rooster', '#D70015', 6680, 'Early starts, fiery ambition, and shared momentum.'),
      ('Ghost', 'ghost', '#1C1C1E', 4590, 'The strange, the quiet, and the stories between worlds.'),
      ('Bunny', 'bunny', '#64D2FF', 9210, 'Baby-blue optimism, gentle rituals, and bright mornings.'),
      ('Dog', 'dog', '#C56A2D', 11900, 'Rusty-orange warmth, loyalty, and familiar faces.'),
      ('Butterfly', 'butterfly', '#BF5AF2', 7460, 'New perspectives, beautiful shifts, and becoming.'),
      ('Peacock', 'peacock', '#0A3D62', 5820, 'Navy calm, thoughtful display, and quiet confidence.')
    ON CONFLICT (slug) DO NOTHING
  `);
  await tx.execute(sql`
    INSERT INTO users (display_name, username, avatar, community_id, is_live, is_premium, follower_count, following_count)
    SELECT seed.display_name, seed.username, seed.avatar, c.id, seed.is_live, seed.is_premium, seed.follower_count, seed.following_count
    FROM (VALUES
      ('Theo Park', 'theo.p', 'TP', 'saffron-club', true, true, 8920, 241),
      ('Nia Sol', 'nia.sol', 'NS', 'moss-and-stone', false, false, 2180, 614),
      ('Jon Bell', 'jonbell', 'JB', 'night-shift', true, false, 1640, 198),
      ('Maya Chen', 'maya.c', '', 'ladybug', false, false, 4380, 326),
      ('Noah Vale', 'noah.v', '', 'cat', false, false, 3910, 284)
    ) AS seed(display_name, username, avatar, slug, is_live, is_premium, follower_count, following_count)
    JOIN communities c ON c.slug = seed.slug
    ON CONFLICT (username) DO NOTHING
  `);
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
      'A quick moment from the Ladybug Community.', '', NULL, 196, 21, 9
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
      ('theo.p', 'image', '', 'A little more color for the week ahead.', 'https://images.local/animus-feed-saffron.png', NULL, 642, 46, 24),
      ('nia.sol', 'image', '', 'Found this light on the walk home.', 'https://images.local/animus-feed-blue.png', NULL, 311, 22, 12),
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
      ('theo.p', 'live', 'Theo is live now', 'Saffron Club · Studio session', true),
      ('theo.p', 'community', 'Saffron Club has a new note', 'A new weekly prompt is ready.', true)
    ) AS seed(username, kind, title, detail, read)
    JOIN users u ON u.username = seed.username
    WHERE NOT EXISTS (SELECT 1 FROM notifications)
  `);
  });
}