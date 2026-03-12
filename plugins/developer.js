// plugins/developer.js
const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "developer",
  alias: ["dev", "creator", "owner"],
  desc: "Show bot developer information",
  category: "info",
  react: "👑",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, reply }) => {
  try {
    // Add processing reaction
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    // Your details
    const ownerName = config.OWNER_NAME || "Mulax Prime";
    const ownerNumber = config.OWNER_NUMBER || "26775462914";
    const botName = config.BOT_NAME || "MULAA SIGIL XMD";
    const github = "https://github.com/romeobwiii/MULAA-SIGIL-XMD";
    const channel = "https://whatsapp.com/channel/0029VaXXXXXXXXXX"; // Add your channel if you have one
    const image = "https://files.catbox.moe/rmv06k.jpg"; // Your bot image

    const caption = `
╔══════════════════════════════════╗
║     👑 *DEVELOPER INFORMATION*    ║
╚══════════════════════════════════╝

👤 *Owner:* ${ownerName}
📱 *Number:* wa.me/${ownerNumber}
🤖 *Bot:* ${botName}
📌 *Prefix:* ${config.PREFIX || '.'}

━━━━━━━━━━━━━━━━━━━━━━

🔗 *LINKS*

📂 *Repository:*
${github}

📢 *Channel:*
${channel}

━━━━━━━━━━━━━━━━━━━━━━

📊 *BOT STATS*

⚡ *Version:* 1.0.0
📦 *Platform:* Multi-Device
🔧 *Framework:* Baileys MD
💎 *Status:* 🟢 Online

━━━━━━━━━━━━━━━━━━━━━━

💬 *ABOUT*

MULAA SIGIL XMD is a powerful WhatsApp bot
with features including games, economy,
downloaders, AI chat, and much more!

━━━━━━━━━━━━━━━━━━━━━━

⚡ *Powered by ${botName}*
📌 *Created by Mulax Prime*
    `.trim();

    // Success reaction
    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await malvin.sendMessage(
      from,
      {
        image: { url: image },
        caption
      },
      { quoted: mek }
    );

  } catch (e) {
    console.error("Developer Command Error:", e);
    
    // Error reaction
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
    } catch (reactError) {}
    
    reply("❌ *Error:* Unable to fetch developer information.");
  }
});