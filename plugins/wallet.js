// plugins/wallet.js
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");
const config = require("../config");

const ecoPath = path.join(__dirname, "../database/economy.json");

// Ensure economy file exists
function loadEconomy() {
  if (!fs.existsSync(ecoPath)) {
    fs.mkdirSync(path.dirname(ecoPath), { recursive: true });
    fs.writeFileSync(ecoPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(ecoPath));
}

function saveEconomy(data) {
  fs.writeFileSync(ecoPath, JSON.stringify(data, null, 2));
}

cmd(
  {
    pattern: "wallet",
    alias: ["bal", "balance", "coins"],
    desc: "Check your wallet balance",
    category: "economy",
    react: "💰",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "💰",
          key: mek.key
        }
      });

      const economy = loadEconomy();
      const userId = sender;

      // Create wallet if not exists
      if (!economy[userId]) {
        economy[userId] = {
          coins: 500, // starting balance
          lastDaily: 0,
          lastGamble: 0,
        };
        saveEconomy(economy);
      }

      const balance = economy[userId].coins;
      const userNumber = userId.split("@")[0];

      const text = `
╔══════════════════════════════════╗
║     💰 *WALLET BALANCE*          ║
╠══════════════════════════════════╣
║ 👤 *User:* @${userNumber}
║ 💎 *Balance:* ${balance.toLocaleString()} coins
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 *Economy Commands:*
└ 💰 wallet - Check balance
└ 🎰 slots - Play slot machine
└ 🎲 gamble - Gamble your coins
└ 📅 daily - Claim daily reward
└ 💸 work - Work for coins
└ 📤 transfer - Send coins to others

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
`.trim();

      await malvin.sendMessage(
        from,
        {
          text,
          mentions: [userId],
        },
        { quoted: mek }
      );

    } catch (err) {
      console.error("Wallet Error:", err);
      reply("❌ *Failed to load wallet.*");
    }
  }
);