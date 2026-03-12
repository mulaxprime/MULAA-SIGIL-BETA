// plugins/richlist.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const ECONOMY_FILE = path.join(__dirname, "../database/economy.json");

// Read economy data
function readEconomy() {
  if (!fs.existsSync(ECONOMY_FILE)) return {};
  return JSON.parse(fs.readFileSync(ECONOMY_FILE, "utf-8"));
}

cmd({
  pattern: "richlist",
  alias: ["top", "leaderboard", "richest"],
  desc: "Show top richest users",
  react: "🏆",
  category: "economy",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, reply }) => {
  try {
    // Add reaction
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    const economy = readEconomy();
    
    // Convert to array and sort by coins
    const users = Object.entries(economy)
      .map(([userId, data]) => ({ userId, coins: data.coins || 0 }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);

    if (!users.length) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply("❌ *No economy data found.*");
    }

    let text = `╔══════════════════════════════════╗
║     🏆 *TOP RICHEST USERS*      ║
╠══════════════════════════════════╣\n`;

    users.forEach((user, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤";
      const userNumber = user.userId.split("@")[0];
      text += `║ ${medal} ${i+1}. @${userNumber}\n`;
      text += `║    💰 ${user.coins.toLocaleString()} coins\n`;
    });

    text += `╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await malvin.sendMessage(
      from,
      {
        text,
        mentions: users.map(u => u.userId)
      },
      { quoted: mek }
    );

  } catch (e) {
    console.error("Richlist Error:", e);
    
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
    } catch {}
    
    reply("❌ *Error generating richlist.*");
  }
});