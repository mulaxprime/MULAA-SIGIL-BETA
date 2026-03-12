// plugins/alive.js
const { cmd } = require("../command");

cmd(
  {
    pattern: "alive",
    react: "🤖",
    desc: "Show bot status",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply }) => {
    try {
      const from = mek.key.remoteJid;

      // Add reaction to show bot is processing
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Set bot status as recording
      await malvin.sendPresenceUpdate("recording", from);

      // Alive Image & Caption with your details
      const caption = `
╔════════════════════════╗
║     ⚡ MULAA SIGIL XMD ⚡     ║
╚════════════════════════╝

📡 *Status:* 🟢 Online & Running Smoothly
🧩 *Framework:* MULAA Engine V1
👑 *Owner:* Mulax Prime (26775462914)
📱 *Bot Number:* 26778388528

─────────────────────────

📢 *WhatsApp Channel:*
https://whatsapp.com/channel/0029VbBdM812kNFhR12QdI2F

💻 *Repository:*
https://github.com/romeobwiii/MULAA-SIGIL-XMD

─────────────────────────

💜 *Technology with Souls and Emotions* 🏆

⚠️ *Notice:* Use responsibly. We take no liability for misuse.

╔════════════════════════╗
║   🔥 MULAA SIGIL — NEXT GEN BOT 🔥   ║
╚════════════════════════╝
      `;

      await malvin.sendMessage(
        from,
        {
          image: { url: "https://files.catbox.moe/rmv06k.jpg" },
          caption,
        },
        { quoted: mek }
      );

      // Change reaction to success
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      // Optional delay for natural timing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Send voice message
      await malvin.sendMessage(
        from,
        {
          audio: { url: "https://files.catbox.moe/wz8rh7.mp3" },
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      
      // Send error reaction
      try {
        await malvin.sendMessage(mek.key.remoteJid, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ Error while sending alive message!");
    }
  }
);