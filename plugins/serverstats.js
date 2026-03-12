// plugins/serverstats.js
const { cmd } = require("../command");
const os = require("os");
const moment = require("moment");
const config = require("../config");

cmd(
  {
    pattern: "serverstats",
    alias: ["stats", "sysstats", "system", "hostinfo"],
    desc: "Show server statistics and system information",
    react: "📊",
    category: "utility",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // System Information
      const platform = os.type(); // OS type
      const platformRelease = os.release(); // OS release
      const arch = os.arch(); // CPU architecture
      const hostname = os.hostname(); // Hostname
      const cpuModel = os.cpus()[0].model; // CPU model
      const cpuCores = os.cpus().length; // CPU cores
      const cpuSpeed = os.cpus()[0].speed; // CPU speed in MHz
      
      // Uptime calculations
      const uptimeSeconds = os.uptime();
      const uptimeFormatted = moment.duration(uptimeSeconds * 1000).humanize();
      const uptimeHours = (uptimeSeconds / 3600).toFixed(2);
      
      // Memory calculations
      const totalMem = os.totalmem() / 1024 / 1024 / 1024; // GB
      const freeMem = os.freemem() / 1024 / 1024 / 1024; // GB
      const usedMem = totalMem - freeMem;
      const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);
      
      // Process memory
      const processMem = process.memoryUsage();
      const rss = (processMem.rss / 1024 / 1024).toFixed(2); // MB
      const heapTotal = (processMem.heapTotal / 1024 / 1024).toFixed(2); // MB
      const heapUsed = (processMem.heapUsed / 1024 / 1024).toFixed(2); // MB
      
      // Load average (Unix-like systems)
      let loadAvg = "N/A";
      if (os.loadavg) {
        const loads = os.loadavg().map(load => load.toFixed(2));
        loadAvg = loads.join(", ");
      }
      
      // Network interfaces
      const networkInterfaces = os.networkInterfaces();
      let ipAddress = "N/A";
      for (const [name, nets] of Object.entries(networkInterfaces)) {
        for (const net of nets) {
          if (net.family === 'IPv4' && !net.internal) {
            ipAddress = net.address;
            break;
          }
        }
      }

      const stats = `
╔══════════════════════════════════╗
║     📊 *MULAA SIGIL XMD*         ║
║        *SERVER STATISTICS*       ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 👑 *Owner:* ${config.OWNER_NAME}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🖥️ *SYSTEM INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━

📌 *Hostname:* ${hostname}
🌐 *Platform:* ${platform} (${platformRelease})
⚙️ *Architecture:* ${arch}
🆔 *IP Address:* ${ipAddress}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *CPU INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━

🔧 *Model:* ${cpuModel}
🎯 *Cores:* ${cpuCores}
⚡ *Speed:* ${cpuSpeed} MHz
📊 *Load Avg:* ${loadAvg}

━━━━━━━━━━━━━━━━━━━━━━
💾 *MEMORY USAGE*
━━━━━━━━━━━━━━━━━━━━━━

📊 *Total RAM:* ${totalMem.toFixed(2)} GB
📈 *Used RAM:* ${usedMem.toFixed(2)} GB
📉 *Free RAM:* ${freeMem.toFixed(2)} GB
📊 *Usage:* ${memUsagePercent}%

━━━━━━━━━━━━━━━━━━━━━━
🔄 *PROCESS MEMORY*
━━━━━━━━━━━━━━━━━━━━━━

📦 *RSS:* ${rss} MB
🗄️ *Heap Total:* ${heapTotal} MB
💎 *Heap Used:* ${heapUsed} MB

━━━━━━━━━━━━━━━━━━━━━━
⏱️ *UPTIME*
━━━━━━━━━━━━━━━━━━━━━━

🕒 *System:* ${uptimeFormatted} (${uptimeHours} hours)
🤖 *Bot Process:* ${moment.duration(process.uptime() * 1000).humanize()}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
📌 *Owner:* Mulax Prime (${config.OWNER_NUMBER})
━━━━━━━━━━━━━━━━━━━━━━
`;

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(stats);

    } catch (e) {
      console.error("ServerStats Command Error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Unable to fetch server statistics.");
    }
  }
);