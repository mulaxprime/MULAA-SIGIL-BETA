const { cmd } = require("../command");

global.chatbotUsers = global.chatbotUsers || {};

cmd(
  {
    pattern: "chatbot",
    desc: "Enable or disable AI chatbot mode",
    category: "ai",
    react: "🤖",
    filename: __filename
  },
  async (client, mek, m, { text, reply }) => {
    if (!text) {
      return reply(
        "🤖 *Chatbot Mode*\n\n.chatbot on\n.chatbot off"
      );
    }

    const user = m.sender;

    if (text.toLowerCase() === "on") {
      global.chatbotUsers[user] = true;
      return reply("✅ *Chatbot mode enabled.*\nJust talk normally now.");
    }

    if (text.toLowerCase() === "off") {
      delete global.chatbotUsers[user];
      return reply("❌ *Chatbot mode disabled.*");
    }

    reply("Use `.chatbot on` or `.chatbot off`");
  }
);
