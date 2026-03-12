// plugins/toimg.js
const { cmd, commands } = require("../command");
const { Sticker } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("../lib/msg.js");
const fs = require("fs");
const config = require("../config");

cmd(
  {
    pattern: "toimg",
    alias: ["img", "photo", "sticker2img", "s2img"],
    react: "🖼️",
    desc: "Convert a sticker to an image",
    category: "utility",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, quoted, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Check if replying to a sticker
      if (!quoted || !quoted.stickerMessage) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🖼️ *MULAA SIGIL XMD - Sticker to Image*\n\n` +
          `❌ *Please reply to a sticker!*\n\n` +
          `📌 *Usage:*\n` +
          `1. Send or receive a sticker\n` +
          `2. Reply to it with \`${config.PREFIX}toimg\`\n` +
          `3. The bot will convert it to an image`
        );
      }

      // Download the sticker
      const stickerBuffer = await downloadMediaMessage(quoted, "stickerInput");
      
      if (!stickerBuffer) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Failed to download the sticker.* Please try again!");
      }

      // Create sticker object with your branding
      const sticker = new Sticker(stickerBuffer, {
        pack: config.BOT_NAME || "MULAA SIGIL XMD",
        author: config.OWNER_NAME || "Mulax Prime",
        type: "FULL", // Ensures full sticker format
        quality: 100, // Maximum quality
      });

      // Convert to image buffer
      const imageBuffer = await sticker.toBuffer({ format: "image/jpeg" });

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      // Send the image
      await malvin.sendMessage(
        from,
        {
          image: imageBuffer,
          caption: `╔══════════════════════════════════╗
║     🖼️ *STICKER TO IMAGE*      ║
╠══════════════════════════════════╣
║ ✅ *Successfully converted!*     ║
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 👑 *Owner:* ${config.OWNER_NAME}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD*`,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("ToImg Command Error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      // Handle specific errors
      if (e.message.includes("not a sticker")) {
        reply("❌ *Invalid sticker format!* Please reply to a valid WhatsApp sticker.");
      } else if (e.message.includes("download")) {
        reply("❌ *Failed to download sticker.* The file might be corrupted.");
      } else {
        reply(`❌ *Error:* ${e.message || "Unknown error occurred"}`);
      }
    }
  }
);