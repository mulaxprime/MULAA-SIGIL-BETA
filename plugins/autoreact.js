// plugins/autoreact.js
const config = require("../config");

module.exports = async (malvin, m) => {
  try {
    // Check if auto-react is enabled in config
    if (!config.AUTO_REACT) return;

    const fromMe = m.key.fromMe;
    if (fromMe || !m.message) return;

    // Define a list of random emojis with categories
    const emojis = {
      love: ["❤️", "💕", "💗", "💓", "💖", "💘", "💝", "🥰"],
      fire: ["🔥", "💥", "⚡", "✨"],
      laugh: ["😂", "🤣", "😆", "😹", "😄", "😁"],
      like: ["👍", "👌", "🤝", "💯", "✅", "⭐"],
      cool: ["😎", "🤙", "👑", "💪", "🆒", "🎯"],
      wow: ["😲", "😱", "🤯", "🌟", "🎉", "👏"],
      sad: ["😢", "😭", "💔", "😿", "🥺"],
      angry: ["😤", "😠", "🤬", "👿", "💢"],
      thinking: ["🤔", "🧐", "🤨", "💭", "❓"],
      celebration: ["🎊", "🎉", "🎈", "🥳", "🎂", "🎁"]
    };

    // Flatten all emojis into one array
    const allEmojis = Object.values(emojis).flat();

    // Pick one randomly
    const emoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];

    // Send the reaction
    await malvin.sendMessage(m.key.remoteJid, {
      react: {
        text: emoji,
        key: m.key,
      },
    });

    // Optional: Log reaction in console (commented out)
    // console.log(`🤖 MULAA SIGIL XMD reacted with ${emoji}`);

  } catch (err) {
    console.error("❌ Auto React Error:", err);
  }
};