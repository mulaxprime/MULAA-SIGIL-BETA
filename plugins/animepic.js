// plugins/animepic.js
const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "animepic",
    react: "🎌",
    desc: "Get a random anime picture",
    category: "fun",
    filename: __filename,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      // Add reaction to show processing
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Using Nekos API for anime images
      const res = await axios.get("https://nekos.life/api/v2/img/neko");
      const imgUrl = res.data.url;

      await malvin.sendMessage(
        from,
        {
          image: { url: imgUrl },
          caption: `🎌 *Here's your random anime picture!*

⚡ *Powered by Mulaa Company*`,
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
      
    } catch (e) {
      console.error(e);
      
      // Send error reaction
      try {
        await malvin.sendMessage(mek.key.remoteJid, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ Failed to fetch anime picture. Try again later.");
    }
  }
);