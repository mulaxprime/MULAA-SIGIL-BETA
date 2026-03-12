// plugins/sigil.js
const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "sigil",
    alias: ["ai", "ask", "chat"],
    react: "💜",
    desc: "Chat with MULAA SIGIL AI",
    category: "ai",
    filename: __filename,
  },
  async (malvin, mek, m, { from, args, reply }) => {
    try {
      const q = args.join(" ");
      if (!q) return reply("❌ Please provide a question. Example: `.sigil who created you?`");

      // Add reaction to show processing
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Using a free AI API (you can swap with your preferred one)
      const res = await axios.get(`https://api.affiliateplus.xyz/api/chatbot`, {
        params: {
          message: q,
          botname: "MULAA SIGIL AI",
          ownername: "Amantle Mpaekae (Mulax Prime)",
          user: from,
        },
      });

      const answer = res.data.message;

      await malvin.sendMessage(
        from,
        {
          text: `💜 *MULAA SIGIL AI* 🏆
          
${answer}

━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by Mulaa Company*
📍 Gaborone, Botswana 🇧🇼`,
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
      
      reply("❌ Error while fetching AI response. Please try again later.");
    }
  }
);