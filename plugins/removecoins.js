// plugins/removecoins.js
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");
const config = require("../config");

const ECONOMY_FILE = path.join(__dirname, "../database/economy.json");

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, "../database"))) {
  fs.mkdirSync(path.join(__dirname, "../database"), { recursive: true });
}

function readEconomy() {
  if (!fs.existsSync(ECONOMY_FILE)) return {};
  return JSON.parse(fs.readFileSync(ECONOMY_FILE, "utf-8"));
}

function writeEconomy(data) {
  fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2));
}

cmd(
  {
    pattern: "removecoins",
    alias: ["removemoney", "takecoins", "rmcoins"],
    desc: "Owner only: Remove coins from a user's wallet",
    category: "economy",
    react: "💸",
    filename: __filename,
    fromMe: true, // Only owner
  },
  async (malvin, mek, m, { from, sender, args, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const ownerNumber = config.OWNER_NUMBER.replace(/\D/g, "");
      const userNumber = sender.split("@")[0];

      if (userNumber !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Only the owner can use this command.*");
      }

      if (!args[0] || !args[1]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `💸 *MULAA SIGIL XMD - Remove Coins*\n\n` +
          `❌ *Usage:* \`${config.PREFIX}removecoins @user <amount>\`\n` +
          `📌 *Example:* \`${config.PREFIX}removecoins @26775462914 500\``
        );
      }

      const targetMention = args[0];
      const targetId = targetMention.replace(/[^\d]/g, "");
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Please enter a valid amount of coins.*");
      }

      const economy = readEconomy();

      if (!economy[targetId]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *This user has no coins in their wallet.*");
      }

      const oldBalance = economy[targetId].coins || 0;
      economy[targetId].coins = Math.max(0, oldBalance - amount);
      writeEconomy(economy);

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(
        `╔══════════════════════════════════╗
║     💸 *COINS REMOVED*           ║
╠══════════════════════════════════╣
║ 👤 *User:* @${targetId}
║ 💰 *Amount:* ${amount} coins
║ 💎 *New Balance:* ${economy[targetId].coins} coins
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
        { mentions: [targetMention] }
      );

    } catch (e) {
      console.error("RemoveCoins Command Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      await reply("❌ *Unable to remove coins. Try again later.*");
    }
  }
);