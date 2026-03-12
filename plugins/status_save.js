// plugins/status-save-combined.js
const { cmd } = require("../command");
const { getRandom } = require('../lib/functions');
const fs = require('fs');
const config = require("../config");

// Command version (explicit command)
cmd(
{
  pattern: "status",
  alias: ["save", "dlstatus", "st", "save-status"],
  react: "📥",
  desc: "Download status updates (reply to a status)",
  category: "downloader",
  filename: __filename,
  fromMe: false,
},
async (malvin, mek, m, { from, reply }) => {
  await handleStatusDownload(malvin, mek, m, from, reply);
});

// Keyword version (triggered by specific words)
cmd(
{
  on: "body"
},
async (malvin, mek, m, { from, body, reply }) => {
  if (!m.quoted || !mek || !mek.message || !body) return;

  const data = JSON.stringify(mek.message, null, 2);
  const jsonData = JSON.parse(data);
  const isStatus = jsonData?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast';
  if (!isStatus) return;

  let bdy = body.toLowerCase();
  let keywords = [
    "දියම්", "දෙන්න", "දාන්න", "එවන්න", "ඕන", "ඕනා", 
    "එවපන්", "දාපන්", "එව්පන්", "send", "give", "save", 
    "status", "download", "dl", "ewpn", "ewapan", "ewanna", 
    "danna", "dpn", "dapan", "ona", "daham", "diym", "dhm",
    "📥", "⬇️", "💾"
  ];
  
  let kk = keywords.map(word => word.toLowerCase());

  if (kk.includes(bdy)) {
    await handleStatusDownload(malvin, mek, m, from, reply);
  }
});

// Shared handler function
async function handleStatusDownload(malvin, mek, m, from, reply) {
  try {
    // Check if replying to a message
    if (!m.quoted) {
      return reply(
        `📥 *MULAA SIGIL XMD - Status Downloader*\n\n` +
        `❌ *Please reply to a status message!*\n\n` +
        `📌 *Usage:*\n` +
        `1. View a status\n` +
        `2. Reply to it with \`${config.PREFIX}status\`\n` +
        `3. The bot will download and send it to you`
      );
    }

    // Check if it's a status
    const data = JSON.stringify(mek.message, null, 2);
    const jsonData = JSON.parse(data);
    const isStatus = jsonData?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast';
    
    if (!isStatus) {
      return reply("❌ *This is not a status update!*\nPlease reply to a status message.");
    }

    // Status caption with branding
    const caption = `╔══════════════════════════════════╗
║     📥 *STATUS DOWNLOADER*      ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 👑 *Owner:* ${config.OWNER_NAME} (${config.OWNER_NUMBER})
╠══════════════════════════════════╣
║ ✅ *Status saved successfully!*   ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD*`;

    // Handle different media types
    if (m.quoted.type === 'imageMessage') {
      let buff = await m.quoted.download();
      await malvin.sendMessage(from, {
        image: buff,
        caption: caption
      }, { quoted: mek });

    } else if (m.quoted.type === 'videoMessage') {
      let buff = await m.quoted.download();
      await malvin.sendMessage(from, {
        video: buff,
        mimetype: "video/mp4",
        fileName: `status_${Date.now()}.mp4`,
        caption: caption
      }, { quoted: mek });

    } else if (m.quoted.type === 'audioMessage') {
      let buff = await m.quoted.download();
      await malvin.sendMessage(from, {
        audio: buff,
        mimetype: "audio/mp4",
        ptt: true,
        caption: caption
      }, { quoted: mek });

    } else if (m.quoted.type === 'extendedTextMessage' || m.quoted.type === 'conversation') {
      const text = m.quoted.msg?.text || m.quoted.msg?.caption || '';
      await malvin.sendMessage(from, { 
        text: `📝 *Status Text:*\n\n${text}\n\n${caption}`
      }, { quoted: mek });

    } else {
      return reply("❌ *Unsupported media type!*");
    }

  } catch (error) {
    console.error("Status Downloader Error:", error);
    reply(`❌ *Error:* ${error.message}`);
  }
}