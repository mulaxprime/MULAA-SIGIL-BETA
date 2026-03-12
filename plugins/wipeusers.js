// plugins/wipeusers.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

// Path to your database files
const ecoPath = path.join(__dirname, "../database/economy.json");
const usersPath = path.join(__dirname, "../database/users.json");

cmd({
  pattern: "wipeusers",
  alias: ["wipe-users", "resetusers", "clearusers"],
  desc: "Wipe all registered users (Owner only)",
  category: "owner",
  react: "🧹",
  filename: __filename,
  fromMe: true
}, async (malvin, mek, m, { from, reply, sender }) => {
  try {
    // Add reaction
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    // Check owner
    const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
    if (sender !== ownerNumber) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply("❌ *This command is only for the bot owner!*");
    }

    // Wipe economy data
    if (fs.existsSync(ecoPath)) {
      fs.writeFileSync(ecoPath, JSON.stringify({}, null, 2));
    }

    // Wipe users data if exists
    if (fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify({}, null, 2));
    }

    // Reset global db if used
    if (global.db) {
      global.db.users = {};
    }

    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await reply(
      `╔══════════════════════════════════╗
║     🧹 *USERS WIPED*             ║
╠══════════════════════════════════╣
║ ✅ All users have been wiped     ║
║    successfully from database.   ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );

  } catch (e) {
    console.error("WipeUsers Error:", e);
    
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
    } catch {}
    
    reply("❌ *Failed to wipe users.*");
  }
});