// plugins/tourl.js
const { cmd } = require("../command");
const { handleMediaUpload } = require('../lib/catbox');
const config = require("../config");

cmd(
  {
    pattern: "tourl",
    alias: ["upload", "url", "getlink"],
    desc: "Convert media to URL (upload to catbox.moe)",
    react: "💯",
    category: "url",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, q, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const quoted = m.quoted || m.msg?.quoted;
      const mime = quoted?.mimetype || quoted?.msg?.mimetype;

      if (!quoted || !mime) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `💯 *MULAA SIGIL XMD - Media to URL*\n\n` +
          `❌ *Please reply to a media message!*\n\n` +
          `📌 *Usage:*\n` +
          `1. Send an image/video/audio\n` +
          `2. Reply to it with \`${config.PREFIX}tourl\`\n` +
          `3. Get your direct download link`
        );
      }

      // Show what's being uploaded
      const mediaType = mime.split('/')[0];
      await reply(`📤 *Uploading ${mediaType} to catbox.moe...*`);

      const mediaUrl = await handleMediaUpload(quoted, malvin, mime);

      if (!mediaUrl) {
        throw new Error("Upload failed - no URL returned");
      }

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      // Format file size if available
      const fileSize = quoted?.fileLength || quoted?.msg?.fileLength;
      const sizeText = fileSize ? ` (${(fileSize / 1024 / 1024).toFixed(2)} MB)` : '';

      const caption = `
╔══════════════════════════════════╗
║     💯 *MEDIA UPLOAD SUCCESS*    ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 📁 *Type:* ${mediaType.toUpperCase()}
║ 📏 *Size:* ${fileSize ? (fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
║ 🔗 *URL:* 
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
${mediaUrl}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
👑 *Owner:* Mulax Prime (${config.OWNER_NUMBER})
━━━━━━━━━━━━━━━━━━━━━━`;

      await reply(caption);

    } catch (error) {
      console.error("Tourl Error:", error);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}

      // Specific error messages
      let errorMessage = error.message || "Unknown error occurred";
      
      if (errorMessage.includes("size")) {
        errorMessage = "File too large. Catbox.moe limit is ~200MB.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Upload timeout. Please try again.";
      } else if (errorMessage.includes("network")) {
        errorMessage = "Network error. Check your connection.";
      }

      reply(
        `╔══════════════════════════════════╗
║     ❌ *UPLOAD FAILED*           ║
╠══════════════════════════════════╣
║ ${errorMessage.substring(0, 50)}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    }
  }
);