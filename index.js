const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ===== MESSAGE IDS =====
const FIRST_MESSAGE_ID = "1468614243703193811";  // first 11 emojis
const SECOND_MESSAGE_ID = "1468617999316553946"; // next 11 emojis

// ===== EMOJIS FOR EACH MESSAGE =====
const FIRST_MESSAGE_EMOJIS = [
  "🃏","✨","⛈️","💮","👑","📜","💞","🛡️","🦁","🕯️","🎡"
];

const SECOND_MESSAGE_EMOJIS = [
  "⚖️","🙃","☠️","🎐","⛓️","🗼","🌟","🌙","☀️","📯","♾️"
];

// ===== EMOJI → ROLE MAP (for reference) =====
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

// ===== Sapphire bot user ID =====
const SAPPHIRE_BOT_ID = "678344927997853742"; // Sapphire bot ID

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  // Only watch the two specific messages
  if (![FIRST_MESSAGE_ID, SECOND_MESSAGE_ID].includes(reaction.message.id)) return;

  // Determine valid emojis for this message
  const validEmojis = reaction.message.id === FIRST_MESSAGE_ID ? FIRST_MESSAGE_EMOJIS : SECOND_MESSAGE_EMOJIS;
  if (!validEmojis.includes(reaction.emoji.name)) return;

  // Count only humans + Sapphire bot
  const users = await reaction.users.fetch();
  const allowedUsers = users.filter(u => !u.bot || u.id === SAPPHIRE_BOT_ID);

  // If more than 2, remove extra reaction and DM the user
  if (allowedUsers.size > 2) {
    try {
      await reaction.users.remove(user.id);
      console.log(`Removed reaction ${reaction.emoji.name} from ${user.tag} (full)`); 

      try {
        await user.send("❌ This card is already taken.");
      } catch {
        console.log(`Could not DM ${user.tag}`);
      }

    } catch (err) {
      console.log(`Could not remove reaction: ${err}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
