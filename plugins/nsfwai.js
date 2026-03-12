// plugins/nsfwai.js
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

const NEBULA_API_KEY = "nebula_65e5772e";

cmd(
  {
    pattern: "nsfwai",
    alias: ["nsfw", "nsfwgen"],
    desc: "Generate NSFW AI image using Nebula API",
    category: "nsfw",
    react: "🖼️",
    filename: __filename,
    fromMe: false,
  },
  async (conn, mek, m, { from, text, reply }) => {
    try {
      // Add processing reaction
      await conn.sendMessage(from, {
        react: { text: "⏳", key: mek.key }
      });

      if (!text) {
        await conn.sendMessage(from, {
          react: { text: "❌", key: mek.key }
        });
        return reply(
          `🖼️ *MULAA SIGIL XMD - NSFW AI Generator*\n\n` +
          `❌ *Please provide a prompt!*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}nsfwai <prompt>\`\n` +
          `✨ *Example:* \`${config.PREFIX}nsfwai anime girl\``
        );
      }

      const url = "https://nebulabot-stats.onrender.com/coderxsa/nsfw-ai-img";

      const response = await axios.get(url, {
        headers: {
          "x-api-key": NEBULA_API_KEY
        },
        params: {
          prompt: text
        },
        responseType: "arraybuffer",
        timeout: 60000
      });

      if (!response.data) {
        await conn.sendMessage(from, {
          react: { text: "❌", key: mek.key }
        });
        return reply("❌ *Failed to generate image.*");
      }

      const buffer = Buffer.from(response.data);

      await conn.sendMessage(from, {
        react: { text: "✅", key: mek.key }
      });

      await conn.sendMessage(
        from,
        {
          image: buffer,
          caption: `╔══════════════════════════════════╗
║     🖼️ *NSFW AI GENERATED*       ║
╠══════════════════════════════════╣
║ 📝 *Prompt:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}
║ 🤖 *AI:* Nebula
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
        },
        { quoted: mek }
      );

    } catch (err) {
      console.error("Nebula AI Error:", err?.response?.data || err.message);
      
      try {
        await conn.sendMessage(from, {
          react: { text: "❌", key: mek.key }
        });
      } catch {}
      
      reply("❌ *Error generating image from Nebula API.*");
    }
  }
);