// plugins/rank.js
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");
const config = require("../config");

const rankFile = path.join(__dirname, "../database/rank.json");

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, "../database"))) {
  fs.mkdirSync(path.join(__dirname, "../database"), { recursive: true });
}

let rankDB = {};
if (fs.existsSync(rankFile)) {
  rankDB = JSON.parse(fs.readFileSync(rankFile));
}

function saveRank() {
  fs.writeFileSync(rankFile, JSON.stringify(rankDB, null, 2));
}

// Get or create user rank
function getUserRank(userId) {
  if (!rankDB[userId]) {
    rankDB[userId] = { xp: 0, level: 1, messages: 0 };
    saveRank();
  }
  return rankDB[userId];
}

// Add XP and handle level up
function addXP(userId, amount, reply) {
  let user = getUserRank(userId);
  user.xp += amount;
  user.messages += 1;
  let leveledUp = false;

  while (user.xp >= 200 * user.level) {
    user.xp -= 200 * user.level;
    user.level++;
    leveledUp = true;
  }

  saveRank();

  if (leveledUp && reply) {
    reply(
      `╔══════════════════════════════════╗
║     🎉 *LEVEL UP!*                ║
╠══════════════════════════════════╣
║ 👤 @${userId.split("@")[0]}
║ 📊 New Level: *${user.level}*
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
      { mentions: [userId] }
    );
  }
}

// Display user rank
function displayRank(userId) {
  let user = getUserRank(userId);
  let progress = Math.floor((user.xp / (user.level * 200)) * 10);
  let bar = "█".repeat(progress) + "░".repeat(10 - progress);
  
  return `
╔══════════════════════════════════╗
║     🎖 *RANK INFORMATION*         ║
╠══════════════════════════════════╣
║ 👤 @${userId.split("@")[0]}
║ 📊 Level: *${user.level}*
║ 💫 XP: *${user.xp}/${user.level * 200}*
║ 📨 Messages: *${user.messages}*
║ 📈 Progress: ${bar}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;
}

// Get leaderboard
function getLeaderboard(limit = 10) {
  let users = Object.keys(rankDB).map(u => ({ 
    user: u, 
    level: rankDB[u].level, 
    xp: rankDB[u].xp,
    messages: rankDB[u].messages || 0
  }));
  users.sort((a,b) => b.level - a.level || b.xp - a.xp);
  return users.slice(0, limit);
}

// ---------------- COMMANDS ---------------- //

// .rank command
cmd({
  pattern: "rank",
  alias: ["level", "xp"],
  desc: "Check your rank and XP",
  react: "🎖️",
  category: "rank",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, sender, reply }) => {
  try {
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    const rankInfo = displayRank(sender);

    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await reply(rankInfo, { mentions: [sender] });

  } catch (e) {
    console.error("Rank Error:", e);
    reply("❌ Error fetching rank.");
  }
});

// .leaderboard command
cmd({
  pattern: "leaderboard",
  alias: ["top", "lb"],
  desc: "Show top ranked users",
  react: "🏆",
  category: "rank",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, reply }) => {
  try {
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    let top = getLeaderboard(10);
    
    if (top.length === 0) {
      return reply("❌ No ranked users yet.");
    }

    let list = `╔══════════════════════════════════╗
║     🏆 *TOP 10 USERS*           ║
╠══════════════════════════════════╣\n`;

    top.forEach((u, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤";
      list += `║ ${medal} ${i+1}. @${u.user.split("@")[0]}\n`;
      list += `║    Level ${u.level} (${u.xp} XP)\n`;
    });

    list += `╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await reply(list, { mentions: top.map(u => u.user) });

  } catch (e) {
    console.error("Leaderboard Error:", e);
    reply("❌ Error fetching leaderboard.");
  }
});

module.exports = { addXP, getUserRank, displayRank, getLeaderboard };