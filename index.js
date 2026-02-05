require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// ===== CLIENT SETUP =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ===== MESSAGE IDS =====
const MESSAGE_IDS = [
  "1468614243703193811",
  "1468617999316553946"
];

// ===== EMOJI → ROLE MAP =====
const ROLE_MAP = {
  "🃏": "1454795086582775893",
  "✨": "1454787820710531207",
  "⛈️": "1468305146240045099",
  "💮": "1454793186198294611",
  "👑": "1468307484270657710",
  "📜": "1468305512209584385",
  "💞": "1468305908575764573",
  "🛡️": "1468306220484919356",
  "🦁": "1468306375116591165",
  "🕯️": "1468306495010770964",
  "🎡": "1464419940781129798",
  "⚖️": "1468306710505721959",
  "🙃": "1468306825895084227",
  "☠️": "1464419534541946920",
  "🎐": "1468306907734347932",
  "⛓️": "1468307003150696584",
  "🗼": "1468307092296175638",
  "🌟": "1463778379151970415",
  "🌙": "1467901320110280910",
  "☀️": "1464419396293230757",
  "📯": "1465701506559774894",
  "♾️": "1454795317940588647"
};

// ===== READY EVENT =====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== REACTION ADD EVENT =====
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  // fetch partials if needed
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  // only specific messages
  if (!MESSAGE_IDS.includes(reaction.message.id)) return;

  const emoji = reaction.emoji.name;
  const roleId = ROLE_MAP[emoji];
  if (!roleId) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);
  const role = guild.roles.cache.get(roleId);
  if (!role) return;

  // MAX 2 MEMBERS PER ROLE
  if (role.members.size >= 2) {
    try {
      await user.send("❌ This tarot card has already been claimed.");
    } catch {}
    await reaction.users.remove(user.id);
    return;
  }

  // remove other tarot roles
  for (const rId of Object.values(ROLE_MAP)) {
    if (member.roles.cache.has(rId)) {
      await member.roles.remove(rId);
    }
  }

  // assign new role
  await member.roles.add(role);

  try {
    await user.send(`✅ You have claimed 『✧──${role.name}──✧』`);
  } catch {}
});

// ===== LOGIN =====
const token = process.env.TOKEN;
if (!token) {
  console.error("❌ TOKEN is missing! Set your environment variable.");
  process.exit(1);
}

client.login(token);
