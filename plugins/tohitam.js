// plugins/tohitam.js
const axios = require("axios");
const { cmd } = require("../command");
const { uploader } = require("../lib/uploader");
const config = require("../config");

cmd(
  {
    pattern: "tohitam",
    alias: ["blackfilter", "hitam", "hitamkan", "black"],
    react: "🖤",
    desc: "Convert an image into a black-filter version",
    category: "maker",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const q = m.quoted ? m.quoted : m;
      const mime = (q.msg || q).mimetype || "";

      if (!mime || !/image\/(jpeg|png|jpg)/.test(mime)) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply(
          `🖤 *MULAA SIGIL XMD - Black Filter*\n\n` +
          `❌ *Please reply to or send an image (JPG/PNG)!*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}tohitam\`\n` +
          `1. Send an image\n` +
          `2. Reply to it with \`${config.PREFIX}tohitam\``
        );
      }

      await reply("🖤 *Converting your image to black filter...*");

      const media = await q.download();
      if (!media) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply("❌ *Failed to download the image.* Please try again.");
      }

      const uploaded = await uploader(media).catch(() => null);
      if (!uploaded) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply("⚠️ *Failed to upload your image.* Please try again later.");
      }

      const apiUrl = `https://izumiiiiiiii.dpdns.org/ai-image/hytamkan?imageUrl=${encodeURIComponent(uploaded)}`;

      const res = await axios.get(apiUrl, { timeout: 30000 });
      
      if (!res.data || !res.data.result || !res.data.result.download) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        
        return reply(
          `╔══════════════════════════════════╗
║     ❌ *CONVERSION FAILED*        ║
╠══════════════════════════════════╣
║ The black filter API didn't      ║
║ return a valid result.           ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Please try again later.*
━━━━━━━━━━━━━━━━━━━━━━

⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
        );
      }

      const imageUrl = res.data.result.download;
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

      const caption = `
╔══════════════════════════════════╗
║     🖤 *BLACK FILTER COMPLETE*    ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 🎨 *Filter:* Black & White
║ ✨ *Status:* Successfully converted!
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
👑 *Owner:* Mulax Prime (${config.OWNER_NUMBER})
━━━━━━━━━━━━━━━━━━━━━━`;

      await malvin.sendMessage(
        from,
        {
          image: imgRes.data,
          caption: caption,
        },
        { quoted: mek }
      );

    } catch (err) {
      console.error("tohitam.js error:", err);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
      } catch (reactError) {}
      
      // Handle specific errors
      let errorMessage = err.message || "Unexpected error occurred.";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The server took too long to respond.";
      } else if (err.response?.status === 404) {
        errorMessage = "API endpoint not found.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      reply(
        `╔══════════════════════════════════╗
║     ❌ *ERROR OCCURRED*           ║
╠══════════════════════════════════╣
║ ${errorMessage.substring(0, 50)}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Please try again later.*
━━━━━━━━━━━━━━━━━━━━━━

⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    }
  }
);