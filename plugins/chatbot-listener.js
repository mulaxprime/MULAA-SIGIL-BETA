const { cmd } = require("../command");
const axios = require("axios");

const API_URL = "https://nebulabot-wa.onrender.com/coderxsa/aihuman";
const API_KEY = "nebula_1e95e9d0";

cmd(
  {
    // no pattern → this is a listener, not a command
    before: true,
    filename: __filename
  },
  async (client, mek, m) => {
    try {
      if (!m.text) return;
      if (m.fromMe) return;
      if (m.text.startsWith(".")) return;

      if (!global.chatbotUsers || !global.chatbotUsers[m.sender]) return;

      const { data } = await axios.get(API_URL, {
        params: { prompt: m.text },
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 60000
      });

      if (!data || !data.result) return;

      await client.sendMessage(
        mek.key.remoteJid,
        { text: data.result },
        { quoted: mek }
      );

    } catch (err) {
      console.error("Chatbot Listener Error:", err.message);
    }
  }
);
