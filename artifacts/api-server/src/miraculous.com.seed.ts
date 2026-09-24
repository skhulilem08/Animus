type SeedUser = {
  displayName: string;
  username: string;
  avatar: string;
  isLive: boolean;
  isPremium: boolean;
  followerCount: number;
  followingCount: number;
};

type SeedCommunity = {
  name: string;
  slug: string;
  color: string;
  memberCount: number;
  description: string;
  users: SeedUser[];
};

// Colors reflect the Chinese Miracle Box; pale symbols are represented by
// deeper UI accents so text and controls remain readable on white.
export const miraculousCommunities: SeedCommunity[] = [
  {
    name: "Ladybug", slug: "ladybug", color: "#D32F2F", memberCount: 12600,
    description: "Small details, bright spots, and a little courage.",
    users: [
      { displayName: "Maya Chen", username: "maya.c", avatar: "", isLive: false, isPremium: false, followerCount: 4380, followingCount: 326 },
    ],
  },
  {
    name: "Cat", slug: "cat", color: "#242424", memberCount: 7820,
    description: "Independent minds, quiet rooms, and curious nights.",
    users: [
      { displayName: "Noah Vale", username: "noah.v", avatar: "", isLive: false, isPremium: false, followerCount: 3910, followingCount: 284 },
    ],
  },
  {
    name: "Peacock", slug: "peacock", color: "#145C91", memberCount: 5820,
    description: "Blue ideas, thoughtful display, and quiet confidence.", users: [],
  },
  {
    name: "Butterfly", slug: "butterfly", color: "#823A8A", memberCount: 7460,
    description: "New perspectives, beautiful shifts, and becoming.",
    users: [
      { displayName: "Jon Bell", username: "jonbell", avatar: "JB", isLive: true, isPremium: false, followerCount: 1640, followingCount: 198 },
    ],
  },
  {
    name: "Turtle", slug: "turtle", color: "#237844", memberCount: 8940,
    description: "Move gently, notice more, and make space to grow.",
    users: [
      { displayName: "Nia Sol", username: "nia.sol", avatar: "NS", isLive: false, isPremium: false, followerCount: 2180, followingCount: 614 },
    ],
  },
  {
    name: "Fox", slug: "fox", color: "#A85008", memberCount: 9650,
    description: "Clever projects, warm conversations, and good instincts.", users: [],
  },
  {
    name: "Bee", slug: "bee", color: "#8A6500", memberCount: 9420,
    description: "Make something small. Make it with care.",
    users: [
      { displayName: "Theo Park", username: "theo.p", avatar: "TP", isLive: true, isPremium: true, followerCount: 8920, followingCount: 241 },
    ],
  },
  {
    name: "Rabbit", slug: "rabbit", color: "#3277A3", memberCount: 9210,
    description: "Bright possibilities, curious minds, and time for wonder.", users: [],
  },
  {
    name: "Dragon", slug: "dragon", color: "#C63431", memberCount: 11200,
    description: "Big ideas, brave experiments, and unapologetic energy.", users: [],
  },
  {
    name: "Snake", slug: "snake", color: "#087778", memberCount: 5370,
    description: "Change, craft, and a calmer way to begin again.", users: [],
  },
  {
    name: "Horse", slug: "horse", color: "#805231", memberCount: 7130,
    description: "Open roads, steady practice, and grounded stories.", users: [],
  },
  {
    name: "Goat", slug: "goat", color: "#62656D", memberCount: 6100,
    description: "Bring your ideas to life, one sketch at a time.", users: [],
  },
  {
    name: "Monkey", slug: "monkey", color: "#8E640A", memberCount: 5600,
    description: "Make room for play, surprises, and shared laughter.", users: [],
  },
  {
    name: "Rooster", slug: "rooster", color: "#946C0D", memberCount: 6680,
    description: "Bright starts, bold ideas, and shared momentum.", users: [],
  },
  {
    name: "Dog", slug: "dog", color: "#9D541F", memberCount: 11900,
    description: "Warmth, loyalty, and familiar faces.", users: [],
  },
  {
    name: "Pig", slug: "pig", color: "#B83368", memberCount: 6240,
    description: "Kind people, soft landings, and honest joy.", users: [],
  },
  {
    name: "Mouse", slug: "mouse", color: "#736575", memberCount: 4590,
    description: "Notice the small things and make space for everyone.", users: [],
  },
  {
    name: "Ox", slug: "ox", color: "#284879", memberCount: 10800,
    description: "Patient work, clear thinking, and dependable community.", users: [],
  },
  {
    name: "Tiger", slug: "tiger", color: "#98256F", memberCount: 8840,
    description: "Creative force, vivid expression, and fearless curiosity.", users: [],
  },
];