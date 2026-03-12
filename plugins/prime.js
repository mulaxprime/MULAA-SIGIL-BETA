// plugins/dev-sung.js
const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "dev-sung",
    alias: ["sung", "devsung", "founder"],
    react: "🛠️",
    desc: "Show info about Mulaa Sigil AI Founder",
    category: "info",
    filename: __filename,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      const caption = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 *MULAA SIGIL AI — FOUNDER* 👑
┗━━━━━━━━━━━━━━━━━━━━━┛

• 🔸 *Name:* Amantle Mpaekae
• 🔹 *Known As:* Mulax Prime
• ⭐ *Role:* Founder & Lead AI Engineer
• 📍 *Location:* Gaborone, Botswana 🇧🇼
• 🤖 *Project:* MULAA SIGIL XMD
• 💜 *Mission:* Technology with Souls and Emotions
• 🏆 *Company:* Mulaa Company

━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by Mulaa Company*
`.trim();

      // Use a default image if none set in config
      const thumb = config.DEV_SUNG_IMAGE || "https://files.catbox.moe/rmv06k.jpg";

      // Send image + caption with rich preview if supported
      await malvin.sendMessage(
        from,
        {
          image: { url: thumb },
          caption,
          contextInfo: {
            externalAdReply: {
              title: "👑 Amantle Mpaekae — Founder",
              body: "MULAA SIGIL AI • Technology with Souls and Emotions",
              thumbnailUrl: thumb,
              sourceUrl: "https://github.com/romeobwiii"
            }
          }
        },
        { quoted: mek }
      );

      // Optional short follow-up message
      await malvin.sendMessage(
        from,
        {
          text: "📝 *MULAA SIGIL XMD* — Building legacies, not just software. Contact the team for support and collaborations."
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("dev-sung command error:", e);
      // use reply fallback if available
      try {
        await reply("❌ Error showing founder profile: " + (e.message || e));
      } catch {
        // last-resort console log if reply fails
        console.error("Also failed to send reply message.");
      }
    }
  }
);