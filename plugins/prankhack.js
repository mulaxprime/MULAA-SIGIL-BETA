// plugins/prankhack.js
const { cmd } = require("../command");
const config = require("../config");

// Track active pranks per chat
const activePranks = new Set();

cmd(
  {
    pattern: "hack",
    alias: ["hackprank", "prank", "fakehack"],
    react: "💻",
    desc: "Harmless hacking prank (100% fake)",
    category: "fun",
    filename: __filename,
    fromMe: false,
  },

  async (malvin, mek, m, { from, reply }) => {
    try {
      // Prevent double-run
      if (activePranks.has(from)) {
        return reply("⚠️ A prank is already running in this chat.\nType *.stopprank* to cancel it.");
      }
      activePranks.add(from);

      // Detect target
      let target = "You";
      let targetJid = m.sender;

      if (m.quoted?.key?.participant) {
        targetJid = m.quoted.key.participant;
      } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0];
      }

      if (typeof targetJid === "string") {
        target = targetJid.split("@")[0];
      }

      // Start
      await malvin.sendMessage(
        from,
        {
          text:
            `💻 *MULAA SIGIL XMD – Fake Hack Module*\n\n` +
            `🎯 *Target:* ${target}\n\n` +
            `⚠️ *This is 100% FAKE!* Type *.stopprank* anytime to cancel.`,
        },
        { quoted: mek }
      );

      // Steps (smooth timing)
      const steps = [
        "Connecting to target system...",
        "Loading exploit engine...",
        "Bypassing security firewalls...",
        "Scanning directories...",
        "Extracting user data...",
        "Decrypting passwords...",
        "Uploading prank payload...",
        "Completing final steps..."
      ];

      for (const step of steps) {
        if (!activePranks.has(from)) return;
        await malvin.sendMessage(from, { text: `🔹 ${step}` }, { quoted: mek });
        await new Promise((r) => setTimeout(r, 900));
      }

      // Progress bar
      const progress = [10, 28, 45, 63, 80, 92, 100];

      for (const p of progress) {
        if (!activePranks.has(from)) return;
        let bar = "█".repeat(p / 10) + "░".repeat(10 - p / 10);

        await malvin.sendMessage(
          from,
          { text: `📊 Progress: [${bar}] ${p}%` },
          { quoted: mek }
        );

        await new Promise((r) => setTimeout(r, 550));
      }

      // Fake report
      if (activePranks.has(from)) {
        await malvin.sendMessage(
          from,
          {
            text:
              `📂 *SCAN COMPLETE*\n\n` +
              `👤 *Target:* ${target}\n` +
              `📁 *Files:* memes.png, random.zip\n` +
              `🔐 *Password:* ********\n` +
              `🌐 *IP:* 127.0.0.1 (localhost 😂)\n`,
          },
          { quoted: mek }
        );
      }

      // Final reveal
      if (activePranks.has(from)) {
        await malvin.sendMessage(
          from,
          {
            text:
              `╔══════════════════════════════════╗
║     🎭 *PRANK COMPLETED*        ║
╠══════════════════════════════════╣
║ ✔️ No data was accessed          ║
║ ✔️ No hacking was performed      ║
║ ✔️ Everything was simulated      ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
          },
          { quoted: mek }
        );
      }

      activePranks.delete(from);

    } catch (err) {
      console.error("PrankHack Error:", err);
      activePranks.delete(from);
      reply("❌ Error running prank: " + err.message);
    }
  }
);