require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// --------- CONFIG --------- //
// Max number of humans who can claim a single reaction
const MAX_CLAIM = 1;

// Tarot message IDs
const tarotMessages = {
    "1468614243703193811": { // Message 1
        "🃏": "1454795086582775893", // The Fool
        "✨": "1454787820710531207", // The Magician
        "⛈️": "1468305146240045099", // The High Priestess
        "💮": "1454793186198294611", // The Empress
        "👑": "1468307484270657710", // The Emperor
        "📜": "1468305512209584385", // The Hierophant
        "💞": "1468305908575764573", // The Lovers
        "🛡️": "1468306220484919356", // The Chariot
        "🦁": "1468306375116591165", // Strength
        "🕯️": "1468306495010770964", // The Hermit
        "🎡": "1464419940781129798", // Wheel Of Fortune
    },
    "1468617999316553946": { // Message 2
        "⚖️": "1468306710505721959", // Justice
        "🙃": "1468306825895084227", // The Hanged Man
        "☠️": "1464419534541946920", // Death
        "🎐": "1468306907734347932", // Temperance
        "⛓️": "1468307003150696584", // The Devil
        "🗼": "1468307092296175638", // The Tower
        "🌟": "1463778379151970415", // The Star
        "🌙": "1467901320110280910", // The Moon
        "☀️": "1464419396293230757", // The Sun
        "📯": "1465701506559774894", // Judgement
        "♾️": "1454795317940588647", // The World
    },
};

// Optional: add names for DM messages
const tarotNames = {
    "1454795086582775893": "The Fool",
    "1454787820710531207": "The Magician",
    "1468305146240045099": "The High Priestess",
    "1454793186198294611": "The Empress",
    "1468307484270657710": "The Emperor",
    "1468305512209584385": "The Hierophant",
    "1468305908575764573": "The Lovers",
    "1468306220484919356": "The Chariot",
    "1468306375116591165": "Strength",
    "1468306495010770964": "The Hermit",
    "1464419940781129798": "Wheel Of Fortune",
    "1468306710505721959": "Justice",
    "1468306825895084227": "The Hanged Man",
    "1464419534541946920": "Death",
    "1468306907734347932": "Temperance",
    "1468307003150696584": "The Devil",
    "1468307092296175638": "The Tower",
    "1463778379151970415": "The Star",
    "1467901320110280910": "The Moon",
    "1464419396293230757": "The Sun",
    "1465701506559774894": "Judgement",
    "1454795317940588647": "The World",
};

// --------------------------- //

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (user.bot) return; // ignore bots

        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const rolesMap = tarotMessages[reaction.message.id];
        if (!rolesMap) return; // not a tarot message

        const roleId = rolesMap[reaction.emoji.name];
        if (!roleId) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);

        // Count how many humans have this reaction
        const users = await reaction.users.fetch();
        const humanCount = users.filter(u => !u.bot).size;

        if (humanCount > MAX_CLAIM) {
            await reaction.users.remove(user.id); // remove excess reaction
            return;
        }

        // Remove previous role if user has any tarot role in the same message
        for (const emoji in rolesMap) {
            const rId = rolesMap[emoji];
            if (rId !== roleId && member.roles.cache.has(rId)) {
                await member.roles.remove(rId);
                // remove their reaction too
                const msgReaction = reaction.message.reactions.cache.get(emoji);
                if (msgReaction) await msgReaction.users.remove(user.id);
            }
        }

        await member.roles.add(role);

        // Send DM
        const roleName = tarotNames[roleId] || 'this role';
        member.send(`『✧─${roleName}─✧』 has been successfully claimed!`).catch(() => {});

    } catch (err) {
        console.error(err);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (user.bot) return;
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const rolesMap = tarotMessages[reaction.message.id];
        if (!rolesMap) return;

        const roleId = rolesMap[reaction.emoji.name];
        if (!roleId) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);

        // Remove the role when reaction removed
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
        }

    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.TOKEN);
