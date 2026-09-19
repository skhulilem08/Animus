import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

export async function seedAnimus() {
  await db.transaction(async (tx) => {
  await tx.execute(sql`
    INSERT INTO communities (name, slug, color, member_count, description) VALUES
      ('Blue Hour', 'blue-hour', '#2864F0', 18420, 'Quiet minds, late light, and the things worth noticing.'),
      ('Saffron Club', 'saffron-club', '#D78A24', 9420, 'Make something small. Make it with care.'),
      ('Moss & Stone', 'moss-and-stone', '#6B8068', 7310, 'A slower corner for field notes and outdoor rituals.'),
      ('Night Shift', 'night-shift', '#7656B8', 5180, 'For people who come alive after the city goes quiet.'),
      ('Ladybug', 'ladybug', '#FF3B30', 12600, 'Small details, bright spots, and a little courage.'),
      ('Turtle', 'turtle', '#34C759', 8940, 'Move gently, notice more, and make space to grow.'),
      ('Cat', 'cat', '#18251E', 7820, 'Independent minds, quiet rooms, and curious nights.'),
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
      ('Mara Ellison', 'mara.e', 'ME', 'blue-hour', false, false, 1240, 382),
      ('Theo Park', 'theo.p', 'TP', 'saffron-club', true, true, 8920, 241),
      ('Nia Sol', 'nia.sol', 'NS', 'moss-and-stone', false, false, 2180, 614),
      ('Jon Bell', 'jonbell', 'JB', 'night-shift', true, false, 1640, 198),
      ('Ari Vale', 'arivale', 'AV', 'blue-hour', false, false, 742, 288)
    ) AS seed(display_name, username, avatar, slug, is_live, is_premium, follower_count, following_count)
    JOIN communities c ON c.slug = seed.slug
    ON CONFLICT (username) DO NOTHING
  `);
  await tx.execute(sql`
    INSERT INTO posts (author_id, type, text, caption, media_url, link, likes, comments, shares)
    SELECT u.id, seed.type, seed.text, seed.caption, seed.media_url, seed.link, seed.likes, seed.comments, seed.shares
    FROM (VALUES
      ('mara.e', 'text', 'The best ideas usually arrive after the first quiet hour.', '', '', 'https://animus.app/quiet-hour', 248, 18, 9),
      ('theo.p', 'image', '', 'A little more color for the week ahead.', 'https://images.local/animus-feed-saffron.png', NULL, 642, 46, 24),
      ('nia.sol', 'image', '', 'Found this light on the walk home.', 'https://images.local/animus-feed-blue.png', NULL, 311, 22, 12),
      ('jonbell', 'video', '', 'Live from the late shift.', '', NULL, 127, 34, 7)
    ) AS seed(username, type, text, caption, media_url, link, likes, comments, shares)
    JOIN users u ON u.username = seed.username
    WHERE NOT EXISTS (SELECT 1 FROM posts)
  `);
  await tx.execute(sql`
    INSERT INTO messages (sender_id, recipient_id, body, status)
    SELECT sender.id, recipient.id, seed.body, seed.status
    FROM (VALUES
      ('mara.e', 'theo.p', 'That light in your post is perfect.', 'read'),
      ('mara.e', 'nia.sol', 'Are you going to the moss walk this weekend?', 'delivered'),
      ('theo.p', 'mara.e', 'I saved you a spot.', 'sent')
    ) AS seed(sender_username, recipient_username, body, status)
    JOIN users sender ON sender.username = seed.sender_username
    JOIN users recipient ON recipient.username = seed.recipient_username
    WHERE NOT EXISTS (SELECT 1 FROM messages)
  `);
  await tx.execute(sql`
    INSERT INTO notifications (profile_id, kind, title, detail, read)
    SELECT u.id, seed.kind, seed.title, seed.detail, seed.read
    FROM (VALUES
      ('mara.e', 'like', 'Theo liked your post', 'The best ideas usually arrive after the first quiet hour.', false),
      ('mara.e', 'comment', 'Nia commented on your post', 'This is exactly what I needed today.', false),
      ('mara.e', 'live', 'Theo is live now', 'Saffron Club · Studio session', true),
      ('mara.e', 'community', 'Blue Hour has a new note', 'A new weekly prompt is ready.', true)
    ) AS seed(username, kind, title, detail, read)
    JOIN users u ON u.username = seed.username
    WHERE NOT EXISTS (SELECT 1 FROM notifications)
  `);
  });
}