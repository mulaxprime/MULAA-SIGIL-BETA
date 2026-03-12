// plugins/group-events.js
const fs = require("fs");
const path = require("path");

const welcomeFile = path.join(__dirname, "../lib/welcome.json");

module.exports = async (malvin, update, sock) => {
  try {
    if (!update) return;
    
    // Handle group participants update
    if (update.participants && update.jid) {
      const groupJid = update.jid;
      const participants = update.participants;
      const action = update.action; // 'add' or 'remove'

      // Read welcome settings
      let welcomeData = {};
      if (fs.existsSync(welcomeFile)) {
        welcomeData = JSON.parse(fs.readFileSync(welcomeFile));
      }

      // Check if welcome is enabled for this group
      if (!welcomeData[groupJid]?.welcome) return;

      // Get group metadata to get group name
      const groupMetadata = await sock.groupMetadata(groupJid);
      const groupName = groupMetadata.subject;

      for (const participant of participants) {
        const userNumber = participant.split('@')[0];
        const userName = participant.split('@')[0]; // You can fetch name if needed

        if (action === 'add') {
          // New member joined
          const welcomeMessage = `
╔══════════════════════════════════╗
║     👋 *WELCOME TO THE GROUP*    ║
╠══════════════════════════════════╣
║ 👤 *Member:* @${userNumber}
║ 📍 *Group:* ${groupName}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🎉 *Welcome to the family!*

📌 *Group Rules:*
• Be respectful to all members
• No spamming or advertising
• Have fun and enjoy!

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD*
          `;

          await sock.sendMessage(groupJid, {
            text: welcomeMessage,
            mentions: [participant]
          });

          // Update welcome count
          if (!welcomeData[groupJid].welcomeCount) {
            welcomeData[groupJid].welcomeCount = 0;
          }
          welcomeData[groupJid].welcomeCount++;
          fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));

        } else if (action === 'remove') {
          // Member left/removed
          const goodbyeMessage = `
╔══════════════════════════════════╗
║     👋 *MEMBER LEFT*             ║
╠══════════════════════════════════╣
║ 👤 *User:* @${userNumber}
║ 📍 *Group:* ${groupName}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
😢 Goodbye! Hope to see you again.

⚡ *MULAA SIGIL XMD*
          `;

          await sock.sendMessage(groupJid, {
            text: goodbyeMessage,
            mentions: [participant]
          });
        }
      }
    }
  } catch (e) {
    console.error("Group Events Error:", e);
  }
};