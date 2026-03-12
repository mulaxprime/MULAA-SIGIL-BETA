// plugins/animequote.js
const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "animequote",
    react: "📜",
    desc: "Get a random anime quote",
    category: "fun",
    filename: __filename,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      // Fetch a random anime quote
      const res = await axios.get("https://animechan.vercel.app/api/random");
      const { anime, character, quote } = res.data;

      // Send the quote
      await malvin.sendMessage(
        from,
        {
          text: `📜 *Anime Quote*\n\n"${quote}"\n\n💠 *${character}* - ${anime}\n\n⚡ Powered by Mulaa Company`,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply("❌ Failed to fetch anime quote. Try again later.");
    }
  }
);