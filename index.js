require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');

// ===== Keep-alive server (optional) =====
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// ===== Discord Bot =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));

// ===== Message IDs and Role Mapping =====
const MESSAGE_IDS = [
  "1468614243703193811",
  "1468617999316553946"
];

const ROLE_MAP = {
  // Message 1
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
  // Message 2
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

// ===== Reaction Handling =====
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return; // Ignore bot reactions

  try {
    if (reaction.partial) await reaction.fetch();
    if (!MESSAGE_IDS.includes(reaction.message.id)) return;

    const emoji = reaction.emoji.name;
    const roleId = ROLE_MAP[emoji];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const role = guild.roles.cache.get(roleId);
    if (!role) return;

    const humanCount = role.members.filter(m => !m.user.bot).size;

    // Check max 1 human per role
    if (humanCount >= 1) {
      try { await user.send(`❌ Sorry! 『✧──${role.name}──✧』 has already been claimed.`); } catch {}
      try { await reaction.users.remove(user.id); } catch {}
      return;
    }

    // Give role
    const member = await guild.members.fetch(user.id);
    await member.roles.add(role);

    // DM confirmation
    try { await user.send(`✅ You have successfully claimed 『✧──${role.name}──✧』!`); } catch {}

  } catch (err) {
    console.error("Reaction error:", err);
  }
});

// ===== Bot Login =====
client.login(process.env.TOKEN).catch(err => console.error("Login failed:", err));
