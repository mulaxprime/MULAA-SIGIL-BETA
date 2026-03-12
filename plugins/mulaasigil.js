// plugins/mulaasigil.js
const { cmd } = require("../command");

cmd(
  {
    pattern: "mulaasigil",
    alias: ["ms", "sigilinfo", "aboutbot"],
    react: "💜",
    desc: "Shows info about MULAA SIGIL XMD bot and founder",
    category: "info",
    filename: __filename,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      const message = `
💜 *MULAA SIGIL XMD* 🏆

⚡ *About:*
MULAA SIGIL XMD is a powerful WhatsApp bot built with emotional intelligence and African cultural context. Designed to provide seamless automation, fun commands, utilities, and AI-powered interactions.

👑 *Founder:*
- Amantle Mpaekae (Mulax Prime)

📍 *Location:*
- Gaborone, Botswana 🇧🇼

🤖 *Mission:*
- Technology with Souls and Emotions

━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by Mulaa Company*
💜 *Building legacies, not just software*

📌 *Features include:* AI chat, anime pics, memes, quotes, games, moderation tools, and more.

💬 *Support / Contact:* Reach out to the founder for any inquiries or support.

✨ *Stay tuned for updates and new features!*`;

      await malvin.sendMessage(
        from,
        { 
          text: message,
          contextInfo: {
            externalAdReply: {
              title: "💜 MULAA SIGIL XMD",
              body: "Technology with Souls and Emotions",
              thumbnailUrl: "https://files.catbox.moe/rmv06k.jpg",
              sourceUrl: "https://github.com/romeobwiii",
              mediaType: 1
            }
          }
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply("❌ Failed to fetch MULAA SIGIL info. Try again later.");
    }
  }
);