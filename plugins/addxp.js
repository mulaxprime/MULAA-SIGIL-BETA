// plugins/addxp.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

const rankPath = path.join(__dirname, "../lib/rank.json");

// Create rank.json if it doesn't exist
if (!fs.existsSync(rankPath)) {
  fs.writeFileSync(rankPath, JSON.stringify({}, null, 2));
}
let rankDB = JSON.parse(fs.readFileSync(rankPath));

function saveRank() {
  fs.writeFileSync(rankPath, JSON.stringify(rankDB, null, 2));
}

cmd(
  {
    pattern: "addxp",
    alias: ["givexp", "addlevel"],
    desc: "Add XP to a user (Owner only)",
    category: "owner",
    react: "⭐",
    filename: __filename,
    fromMe: true,
  },
  async (conn, m, _, { from, args, sender, reply }) => {
    try {
      // Add processing reaction
      await conn.sendMessage(from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      // Owner verification with your WhatsApp ID
      const ownerNumber = "26775462914@s.whatsapp.net";
      
      if (sender !== ownerNumber) {
        await conn.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply("❌ *Access Denied!*\nThis command is only for the owner (Mulax Prime).");
      }

      // Get mentioned user
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      
      if (!mentioned) {
        await conn.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply(
          "❌ *Usage:* `.addxp @user <amount>`\n" +
          "📌 *Example:* `.addxp @26775462914 100`"
        );
      }

      // Get XP amount
      const xpToAdd = parseInt(args[1]);
      
      if (isNaN(xpToAdd) || xpToAdd <= 0) {
        await conn.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply("❌ Please provide a valid XP amount (positive number).");
      }

      // Initialize user in database if not exists
      if (!rankDB[mentioned]) {
        rankDB[mentioned] = { 
          xp: 0, 
          level: 1, 
          role: "Beginner",
          lastUpdated: Date.now()
        };
      }

      // Add XP
      rankDB[mentioned].xp += xpToAdd;
      rankDB[mentioned].lastUpdated = Date.now();

      // Calculate new level (assuming 100 XP per level)
      const newLevel = Math.floor(rankDB[mentioned].xp / 100) + 1;
      if (newLevel > rankDB[mentioned].level) {
        rankDB[mentioned].level = newLevel;
        rankDB[mentioned].role = getRole(newLevel);
      }

      saveRank();

      // Success reaction
      await conn.sendMessage(from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

      const targetNumber = mentioned.split("@")[0];
      
      await reply(
        `⭐ *MULAA SIGIL XMD - Rank System*\n\n` +
        `✅ Successfully added *${xpToAdd} XP* to @${targetNumber}!\n\n` +
        `📊 *Current Stats:*\n` +
        `• Total XP: *${rankDB[mentioned].xp}*\n` +
        `• Level: *${rankDB[mentioned].level}*\n` +
        `• Role: *${rankDB[mentioned].role}*`,
        { mentions: [mentioned] }
      );

    } catch (e) {
      console.error("AddXP Command Error:", e);
      
      // Error reaction
      try {
        await conn.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Unable to add XP. Try again later.");
    }
  }
);

// Helper function to determine role based on level
function getRole(level) {
  if (level >= 50) return "Legend";
  if (level >= 30) return "Elite";
  if (level >= 20) return "Pro";
  if (level >= 10) return "Advanced";
  if (level >= 5) return "Intermediate";
  return "Beginner";
}