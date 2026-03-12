// plugins/tiktok.js
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
  {
    pattern: "tiktok",
    alias: ["tt", "tiktokdl", "ttdl"],
    desc: "Download TikTok videos without watermark",
    category: "downloader",
    filename: "tiktok.js",
    react: "🎵",
    fromMe: false,
  },
  async (malvin, mek, m, { from, args, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!args[0]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🎵 *MULAA SIGIL XMD - TikTok Downloader*\n\n` +
          `❌ *Please provide a TikTok video URL!*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}tiktok <url>\`\n` +
          `✨ *Example:* \`${config.PREFIX}tiktok https://vt.tiktok.com/xxxx\``
        );
      }

      await reply("⏳ *Fetching TikTok video... Please wait!*");

      let videoUrl = null;
      let videoData = null;
      let apiUsed = "";

      // Try first API (your existing one)
      try {
        const apiUrl1 = `https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${encodeURIComponent(args[0])}`;
        const { data } = await axios.get(apiUrl1, { timeout: 10000 });
        
        if (data?.data?.video) {
          videoUrl = data.data.video;
          videoData = data.data;
          apiUsed = "Primary API";
        }
      } catch (e1) {
        console.log("Primary API failed, trying MULAA SIGIL API...");
      }

      // If first API fails, try your MULAA SIGIL XMD API
      if (!videoUrl) {
        try {
          const apiUrl2 = `https://tiksave-ten.vercel.app/api?url=${encodeURIComponent(args[0])}`;
          const { data } = await axios.get(apiUrl2, { timeout: 10000 });
          
          // Adjust this based on your API's response structure
          if (data?.video || data?.data?.video) {
            videoUrl = data.video || data.data.video;
            videoData = data;
            apiUsed = "MULAA SIGIL API";
          }
        } catch (e2) {
          console.log("MULAA SIGIL API failed");
        }
      }

      // If both APIs fail
      if (!videoUrl) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        
        return reply(
          `╔══════════════════════════════════╗
║     ❌ *DOWNLOAD FAILED*          ║
╠══════════════════════════════════╣
║ Both APIs are currently down.    ║
║ Please try again later.          ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🌐 *Visit our website for unlimited downloads:*
🔗 https://tiksave-ten.vercel.app

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
        );
      }

      // Extract video info
      const title = videoData?.title || videoData?.desc || "TikTok Video";
      const author = videoData?.author || videoData?.user || "Unknown";
      const duration = videoData?.duration || "N/A";
      const views = videoData?.play_count || videoData?.views || "N/A";
      const likes = videoData?.digg_count || videoData?.likes || "N/A";
      const comments = videoData?.comment_count || videoData?.comments || "N/A";
      const shares = videoData?.share_count || videoData?.shares || "N/A";

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const caption = `
╔══════════════════════════════════╗
║     🎵 *TIKTOK DOWNLOADER*       ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 📹 *API:* ${apiUsed}
║ 🎬 *Title:* ${title}
║ 👤 *Author:* ${author}
║ ⏱️ *Duration:* ${duration}
╠══════════════════════════════════╣
║ 📊 *Stats:* 
║ 👁️ Views: ${views}
║ ❤️ Likes: ${likes}
║ 💬 Comments: ${comments}
║ 🔄 Shares: ${shares}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 *URL:* ${args[0].substring(0, 50)}${args[0].length > 50 ? '...' : ''}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
👑 *Owner:* Mulax Prime (${config.OWNER_NUMBER})
━━━━━━━━━━━━━━━━━━━━━━`;

      // Send the video
      await malvin.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption: caption,
          fileName: "tiktok_video.mp4",
          mimetype: "video/mp4",
        },
        { quoted: mek }
      );

    } catch (error) {
      console.error("TikTok Download Error:", error);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply(
        `╔══════════════════════════════════╗
║     ❌ *ERROR OCCURRED*           ║
╠══════════════════════════════════╣
║ ${error.message.substring(0, 50)}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🌐 *For unlimited downloads, visit:*
🔗 https://tiksave-ten.vercel.app

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    }
  }
);