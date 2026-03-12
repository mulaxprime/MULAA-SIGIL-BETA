// plugins/reactions.js
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

// Reliable reaction GIF APIs
const reactions = {
  hug: "https://api.waifu.pics/sfw/hug",
  kiss: "https://api.waifu.pics/sfw/kiss",
  pat: "https://api.waifu.pics/sfw/pat",
  slap: "https://api.waifu.pics/sfw/slap",
  poke: "https://api.waifu.pics/sfw/poke",
  cuddle: "https://api.waifu.pics/sfw/cuddle",
  cry: "https://api.waifu.pics/sfw/cry",
  laugh: "https://api.waifu.pics/sfw/smile",
  wink: "https://api.waifu.pics/sfw/wink",
  dance: "https://api.waifu.pics/sfw/dance",
  highfive: "https://api.waifu.pics/sfw/highfive",
  blush: "https://api.waifu.pics/sfw/blush",
  smug: "https://api.waifu.pics/sfw/smug",
  bored: "https://api.waifu.pics/sfw/bored",
  happy: "https://api.waifu.pics/sfw/smile",
  sad: "https://api.waifu.pics/sfw/cry",
  angry: "https://api.waifu.pics/sfw/kick",
};

Object.keys(reactions).forEach((action) => {
  cmd(
    {
      pattern: action,
      alias: [action + "me"],
      desc: `Send a ${action} reaction`,
      react: action === "hug" ? "🤗" : 
             action === "kiss" ? "💋" : 
             action === "slap" ? "👋" : 
             action === "cry" ? "😢" : 
             action === "laugh" ? "😂" : 
             action === "dance" ? "💃" : 
             action === "highfive" ? "🖐️" : 
             action === "wink" ? "😉" : 
             action === "poke" ? "👉" : 
             action === "pat" ? "👋" : 
             action === "cuddle" ? "🤗" : "🥰",
      category: "reaction",
      filename: __filename,
      fromMe: false,
    },
    async (malvin, mek, m, { from, reply, args }) => {
      try {
        // Add reaction
        await malvin.sendMessage(from, {
          react: {
            text: "⏳",
            key: mek.key
          }
        });

        // Get mentioned user or use default
        const mentionedJid = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        let target = "someone";
        let targetMention = null;
        
        if (mentionedJid) {
          target = `@${mentionedJid.split("@")[0]}`;
          targetMention = mentionedJid;
        } else if (args[0]) {
          target = args[0];
        }

        // Fetch GIF from API
        const res = await axios.get(reactions[action]);
        const gifUrl = res.data?.url || reactions[action];

        const caption = `
╔══════════════════════════════════╗
║     🥰 *REACTION*                ║
╠══════════════════════════════════╣
║ ✨ *${m.pushName || "Someone"}* ${action}s ${target}!
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
`;

        await malvin.sendMessage(from, {
          react: {
            text: "✅",
            key: mek.key
          }
        });

        await malvin.sendMessage(
          from,
          {
            image: { url: gifUrl },
            caption,
            mentions: targetMention ? [targetMention] : []
          },
          { quoted: mek }
        );

      } catch (e) {
        console.error(`${action} command error:`, e);
        
        try {
          await malvin.sendMessage(from, {
            react: {
              text: "❌",
              key: mek.key
            }
          });
        } catch {}
        
        reply(`❌ *Failed to send ${action} reaction.*`);
      }
    }
  );
});