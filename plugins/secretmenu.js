// plugins/secretmenu.js
const { cmd } = require("../command");
const config = require("../config");

// 🔑 Your secret key
const SECRET_KEY = "MULAA2024"; // You can change this to anything you want

cmd(
  {
    pattern: "secretmenu",
    alias: ["hidden", "secret", "vipmenu"],
    desc: "Access hidden secret menu (requires key)",
    category: "hidden",
    react: "🌌",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, args, reply, sender }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "🌌",
          key: mek.key
        }
      });

      // Check if owner (using config)
      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      const isOwner = sender === ownerNumber;

      // Require key or owner
      if (!args[0]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🌌 *MULAA SIGIL XMD - Secret Menu*\n\n` +
          `🔑 *Enter the secret key to unlock.*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}secretmenu <key>\`\n` +
          `✨ *Example:* \`${config.PREFIX}secretmenu MULAA2024\``
        );
      }

      const key = args[0].trim();

      if (key !== SECRET_KEY && !isOwner) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("🚫 *Access Denied!* Wrong key.");
      }

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      // Secret menu content
      const secretMenu = `
╔══════════════════════════════════╗
║     🌌 *SECRET MENU UNLOCKED*    ║
╠══════════════════════════════════╣
║ 🔮 *Hidden Commands:*            ║
╠══════════════════════════════════╣
║ ✦ *.godmode* — Unlimited coins   ║
║ ✦ *.shadowban @user* — Secret ban║
║ ✦ *.reveal* — See hidden stats   ║
║ ✦ *.vipupgrade @user* — VIP user ║
║ ✦ *.darkgift* — Claim ultra reward║
║ ✦ *.secretcoins* — Get 10,000 coins║
║ ✦ *.hiddenkey* — Generate new key ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Keep this menu secret!*
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
`;

      await reply(secretMenu);

    } catch (e) {
      console.error("SecretMenu Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      reply("❌ *Error accessing secret menu.*");
    }
  }
);