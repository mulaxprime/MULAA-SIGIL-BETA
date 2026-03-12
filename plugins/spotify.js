// plugins/spotify.js (Alternative API)
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
  {
    pattern: "spotify",
    alias: ["sp", "spotifydl", "spotifydown"],
    react: "🎧",
    desc: "Download any Spotify track in high quality",
    category: "downloader",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, args, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const query = args.join(" ");
      
      if (!query) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🎧 *MULAA SIGIL XMD - Spotify Downloader*\n\n` +
          `❌ *Please provide a valid Spotify track link or search query!*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}spotify <link or song name>\`\n` +
          `✨ *Examples:*\n` +
          `└ \`${config.PREFIX}spotify https://open.spotify.com/track/xxx\`\n` +
          `└ \`${config.PREFIX}spotify fade alone\``
        );
      }

      // Determine if input is URL or search query
      const isUrl = query.includes("open.spotify.com/track/");
      let apiUrl;

      if (isUrl) {
        apiUrl = `https://api.dreaded.site/api/spotifydl?url=${encodeURIComponent(query)}`;
      } else {
        // Search first then download
        const searchApi = `https://api.dreaded.site/api/spotify?q=${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchApi);
        
        if (!searchRes.data?.result?.length) {
          throw new Error("No results found");
        }
        
        const track = searchRes.data.result[0];
        apiUrl = `https://api.dreaded.site/api/spotifydl?url=${encodeURIComponent(track.url)}`;
        
        // Send search result info
        await malvin.sendMessage(from, {
          text: `🔍 *Found:* ${track.name} - ${track.artists}\n📥 Downloading...`
        }, { quoted: mek });
      }

      const res = await axios.get(apiUrl, { timeout: 30000 });

      if (!res.data?.result?.download) {
        throw new Error("No download link found");
      }

      const result = res.data.result;
      const audioUrl = result.download;

      // Send track metadata
      const caption = `
╔══════════════════════════════════╗
║     🎧 *SPOTIFY DOWNLOADER*      ║
╠══════════════════════════════════╣
║ 🎵 *Title:* ${result.name || 'Unknown'}
║ 👤 *Artist:* ${result.artists || 'Unknown'}
║ 💿 *Album:* ${result.album || 'Unknown'}
║ ⏱️ *Duration:* ${result.duration || 'Unknown'}
║ 📅 *Release:* ${result.releaseDate || 'Unknown'}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your track...*
⏳ Please wait while I send the audio.

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
      `;

      // Send cover image if available
      if (result.thumbnail) {
        await malvin.sendMessage(from, {
          image: { url: result.thumbnail },
          caption: caption
        }, { quoted: mek });
      }

      // Send MP3 audio
      await malvin.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${result.name || 'spotify'}.mp3`,
        },
        { quoted: mek }
      );

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

    } catch (e) {
      console.error("Spotify Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply(`❌ *Error:* ${e.message}\n\nPlease try again with a different link or search query.`);
    }
  }
);