// plugins/owner/allusers.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const ecoFile = path.join(__dirname, "../../lib/economy.json");

// ------------------ Economy ------------------
function loadEco() {
  if (!fs.existsSync(ecoFile)) return {};
  return JSON.parse(fs.readFileSync(ecoFile));
}

// ------------------ Owner-Only Command ------------------
cmd(
  {
    pattern: "allusers",
    alias: ["listusers", "users", "globalusers"],
    react: "👑",
    desc: "Owner only: Check all users globally",
    category: "owner",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Check if user is owner
      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      if (sender !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Access Denied!*\nThis command is only for the owner (Mulax Prime).");
      }

      const eco = loadEco();
      if (!eco || Object.keys(eco).length === 0) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ No users found in the database.");
      }

      let msg = `╔══════════════════════════════════╗
║     👑 *MULAA SIGIL XMD* 👑      ║
║        *Global Users List*        ║
╠══════════════════════════════════╣\n\n`;
      
      let count = 0;
      const userIds = Object.keys(eco);

      for (let userId of userIds) {
        const u = eco[userId];
        const userNumber = userId.split("@")[0];
        
        msg += `👤 *User:* @${userNumber}\n`;
        msg += `💰 *Wallet:* ${u.wallet || 0} coins\n`;
        msg += `🏦 *Bank:* ${u.bank || 0} coins\n`;
        msg += `💎 *Total:* ${(u.wallet || 0) + (u.bank || 0)} coins\n`;
        msg += `🎒 *Inventory:* ${u.inventory?.length || 0} items\n`;
        msg += `⚡ *Pokémon:* ${u.pokemon?.length || 0} caught\n`;
        msg += `📊 *Level:* ${u.level || 1} (${u.xp || 0} XP)\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        count++;
      }

      msg += `╚══════════════════════════════════╝\n`;
      msg += `📊 *Total Users:* ${count}\n`;
      msg += `📌 *Database:* economy.json\n`;
      msg += `⚡ *Powered by MULAA SIGIL XMD*`;

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(msg, { mentions: userIds });

    } catch (err) {
      console.error("AllUsers Command Error:", err);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Failed to fetch users: " + err.message);
    }
  }
);