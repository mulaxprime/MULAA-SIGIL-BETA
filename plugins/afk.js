// plugins/afk.js
const { cmd } = require("../command");
const moment = require("moment");

// Store AFK users
global.afk = global.afk || {};

cmd({
  pattern: "afk",
  alias: ["away", "brb"],
  desc: "Set AFK (Away From Keyboard) status",
  category: "utility",
  react: "💤",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, reply, args, sender }) => {
  try {
    // Add processing reaction
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    const reason = args.join(" ") || "AFK (Away From Keyboard)";
    const senderNumber = sender.split("@")[0];

    // Store AFK status
    global.afk[sender] = {
      reason: reason,
      time: Date.now(),
      from: from,
      name: m.pushName || senderNumber
    };

    // Success reaction
    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    // Create AFK message
    const afkMessage = `
💤 *MULAA SIGIL XMD - AFK MODE*

👤 *User:* @${senderNumber}
📌 *Reason:* ${reason}
⏱️ *Since:* ${moment().format('HH:mm:ss')}

_You will be marked as AFK. Anyone who mentions you will be notified._
    `;

    await reply(afkMessage, { mentions: [sender] });

  } catch (e) {
    console.error("AFK Command Error:", e);
    
    // Error reaction
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
    } catch (reactError) {}
    
    await reply("❌ *Error:* Unable to set AFK status. Try again later.");
  }
});

// AFK detection on mentions
// Add this to your main message handler to detect mentions of AFK users
/*
// In your handleMessage function, add this:
if (global.afk && msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
  for (const mention of msg.message.extendedTextMessage.contextInfo.mentionedJid) {
    if (global.afk[mention]) {
      const afkData = global.afk[mention];
      const afkDuration = moment.duration(Date.now() - afkData.time).humanize();
      
      await sock.sendMessage(from, {
        text: `💤 *@${afkData.name}* is AFK\n📌 *Reason:* ${afkData.reason}\n⏱️ *Duration:* ${afkDuration}`,
        mentions: [mention]
      }, { quoted: msg });
    }
  }
}

// Also check if the user sending message is AFK and came back
if (global.afk[sender]) {
  const afkData = global.afk[sender];
  const afkDuration = moment.duration(Date.now() - afkData.time).humanize();
  
  delete global.afk[sender];
  
  await sock.sendMessage(from, {
    text: `👋 *Welcome back!*\nYou were AFK for *${afkDuration}*\n📌 *Reason:* ${afkData.reason}`
  }, { quoted: msg });
}
*/