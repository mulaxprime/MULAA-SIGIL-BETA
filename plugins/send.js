// plugins/send.js
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
    pattern: "send",
    alias: ["pay", "transfer"],
    desc: "Send coins to another user",
    category: "economy",
    react: "💸",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, args, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "💸",
          key: mek.key
        }
      });

      const economy = readEconomy();
      const userId = sender.split("@")[0];

      if (!args[0] || !args[1]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `💸 *MULAA SIGIL XMD - Send Coins*\n\n` +
          `❌ *Usage:* \`${config.PREFIX}send @user <amount>\`\n` +
          `📌 *Example:* \`${config.PREFIX}send @26775462914 100\``
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
        return reply("❌ *Please enter a valid amount of coins to send.*");
      }

      // Initialize wallets
      if (!economy[userId]) economy[userId] = { coins: 500, lastDaily: 0 };
      if (!economy[targetId]) economy[targetId] = { coins: 500, lastDaily: 0 };

      if (economy[userId].coins < amount) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(`❌ *You don't have enough coins!*\n💎 Your balance: ${economy[userId].coins} coins`);
      }

      // Transfer coins
      economy[userId].coins -= amount;
      economy[targetId].coins += amount;

      writeEconomy(economy);

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(
        `╔══════════════════════════════════╗
║     💸 *TRANSACTION COMPLETE*    ║
╠══════════════════════════════════╣
║ 👤 *Sender:* @${userId}
║ 👤 *Receiver:* @${targetId}
║ 💰 *Amount:* ${amount} coins
║ 💎 *Your Balance:* ${economy[userId].coins} coins
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
        { mentions: [sender, targetMention] }
      );

    } catch (e) {
      console.error("Send Command Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      await reply("❌ *Unable to send coins. Try again later.*");
    }
  }
);