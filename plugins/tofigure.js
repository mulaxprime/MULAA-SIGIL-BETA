// plugins/tofigure.js
const axios = require("axios");
const FormData = require("form-data");
const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "tofigure",
  alias: ["figureai", "figure", "animefig", "img2figure"],
  react: "🎨",
  desc: "Turn an image into an anime-style figure using AI",
  category: "ai",
  filename: __filename,
  fromMe: false,
}, async (conn, m, msg, { from, reply }) => {
  try {
    // Add processing reaction
    await conn.sendMessage(from, {
      react: {
        text: "⏳",
        key: m.key
      }
    });

    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";

    if (!mime.startsWith("image/")) {
      await conn.sendMessage(from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      return reply(
        `🎨 *MULAA SIGIL XMD - AI Figure Generator*\n\n` +
        `❌ *Please reply to or send an image to convert!*\n\n` +
        `📌 *Usage:*\n` +
        `1. Send an image\n` +
        `2. Reply to it with \`${config.PREFIX}tofigure\`\n` +
        `3. Wait for AI to generate your anime figure`
      );
    }

    await reply("🧠 *Processing your image...* This may take 30-60 seconds.");

    const buffer = await q.download();
    if (!buffer) {
      await conn.sendMessage(from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      return reply("⚠️ *Failed to download image.* Please try again.");
    }

    // Upload image to Uguu.se
    const form = new FormData();
    form.append("files[]", buffer, { filename: "image.jpg" });

    const upload = await axios.post("https://uguu.se/upload.php", form, {
      headers: form.getHeaders(),
      timeout: 60000,
    });

    const uploadedUrl = upload.data.files?.[0]?.url;
    if (!uploadedUrl) {
      await conn.sendMessage(from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      return reply("⚠️ *Upload failed.* Please try again later.");
    }

    // Convert to anime figure using Nekolabs API
    const apiUrl = `https://api.nekolabs.my.id/tools/convert/tofigure?imageUrl=${encodeURIComponent(uploadedUrl)}`;
    const res = await axios.get(apiUrl, { timeout: 60000 });

    const result = res.data?.result;
    if (!result) {
      await conn.sendMessage(from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      
      return reply(
        `╔══════════════════════════════════╗
║     ❌ *GENERATION FAILED*        ║
╠══════════════════════════════════╣
║ The AI figure generation failed. ║
║ Please try again later.          ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🌐 *For more AI tools, visit:*
🔗 https://tiksave-ten.vercel.app

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    }

    // Success reaction
    await conn.sendMessage(from, {
      react: {
        text: "✅",
        key: m.key
      }
    });

    const caption = `
╔══════════════════════════════════╗
║     🎨 *AI FIGURE GENERATOR*     ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ ✨ *Result:* Successfully generated!
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
👑 *Owner:* Mulax Prime (${config.OWNER_NUMBER})
━━━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(
      from,
      {
        image: { url: result },
        caption: caption,
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("ToFigure Error:", e);
    
    // Error reaction
    try {
      await conn.sendMessage(from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
    } catch (reactError) {}
    
    // Check for specific errors
    let errorMessage = e.message || "Unexpected error occurred.";
    
    if (e.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. The server took too long to respond.";
    } else if (e.response?.status === 429) {
      errorMessage = "Rate limited. Please try again later.";
    } else if (e.response?.status === 503) {
      errorMessage = "Service unavailable. The AI server is down.";
    }

    reply(
      `╔══════════════════════════════════╗
║     ❌ *ERROR OCCURRED*           ║
╠══════════════════════════════════╣
║ ${errorMessage.substring(0, 50)}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🌐 *For more AI tools, visit:*
🔗 https://tiksave-ten.vercel.app

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );
  }
});