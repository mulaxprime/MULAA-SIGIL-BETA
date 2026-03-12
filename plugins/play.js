// plugins/play.js
const axios = require("axios");
const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "play",
  alias: ["yt", "song", "audio"],
  react: "🎵",
  desc: "Download audio from YouTube",
  category: "download",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, args, reply }) => {
  try {
    // Add processing reaction
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
      
      const usage = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│   🎵 *MULAA SIGIL XMD*   │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

*🎬 YOUTUBE AUDIO DOWNLOADER*

📌 *Usage:*
• .play <song name>
• .play <YouTube URL>

✨ *Examples:*
.play fade alone
.play https://youtu.be/60ItHLz5WEA

━━━━━━━━━━━━━━━━━━━━━━━━━━━
*📢 Official Channel:*
https://whatsapp.com/channel/0029VbBdM812kNFhR12QdI2F

> Powered by Mulaa Company ✨
💜 Technology with Souls and Emotions 🏆`;

      return reply(usage);
    }

    await reply("🔍 *Searching YouTube...* Please wait.");

    // Try multiple search APIs for better results
    let videoInfo = null;
    let searchError = null;

    // API 1: Try yt-search first
    try {
      const searchApi1 = `https://weeb-api.vercel.app/ytsearch?query=${encodeURIComponent(query)}`;
      const response1 = await axios.get(searchApi1, { timeout: 10000 });
      
      if (response1.data && response1.data.length > 0) {
        videoInfo = {
          title: response1.data[0].title,
          duration: response1.data[0].duration || response1.data[0].timestamp || 'Unknown',
          url: response1.data[0].url,
          thumbnail: response1.data[0].thumbnail
        };
        console.log('[PLAY] Found using API 1');
      }
    } catch (e) {
      searchError = e;
      console.log('[PLAY] API 1 failed:', e.message);
    }

    // API 2: If first fails, try another
    if (!videoInfo) {
      try {
        const searchApi2 = `https://api.ryzendesu.vip/api/search/yt?query=${encodeURIComponent(query)}`;
        const response2 = await axios.get(searchApi2, { timeout: 10000 });
        
        if (response2.data && response2.data.length > 0) {
          videoInfo = {
            title: response2.data[0].title,
            duration: response2.data[0].duration || 'Unknown',
            url: `https://youtu.be/${response2.data[0].videoId}`,
            thumbnail: response2.data[0].thumbnail
          };
          console.log('[PLAY] Found using API 2');
        }
      } catch (e) {
        console.log('[PLAY] API 2 failed:', e.message);
      }
    }

    // API 3: Try another fallback
    if (!videoInfo) {
      try {
        const searchApi3 = `https://api.dreaded.site/api/ytsearch?query=${encodeURIComponent(query)}`;
        const response3 = await axios.get(searchApi3, { timeout: 10000 });
        
        if (response3.data && response3.data.result && response3.data.result.length > 0) {
          videoInfo = {
            title: response3.data.result[0].title,
            duration: response3.data.result[0].duration || 'Unknown',
            url: response3.data.result[0].url,
            thumbnail: response3.data.result[0].thumbnail
          };
          console.log('[PLAY] Found using API 3');
        }
      } catch (e) {
        console.log('[PLAY] API 3 failed:', e.message);
      }
    }

    // If no results found
    if (!videoInfo) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      
      const noResultsMsg = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│        ❌ *ERROR*         │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

*No results found for:* 
"${query}"

Try:
• Using different keywords
• Checking spelling
• Using YouTube URL directly

━━━━━━━━━━━━━━━━━━━━━━━━━━━
*📢 Join our channel:*
https://whatsapp.com/channel/0029VbBdM812kNFhR12QdI2F

> Powered by Mulaa Company ✨`;

      return reply(noResultsMsg);
    }

    await reply(`🎵 *Found:* ${videoInfo.title}\n⏱️ Duration: ${videoInfo.duration}\n\n⬇️ *Downloading audio...*`);

    // Use Prince Tech API for audio download
    const encodedUrl = encodeURIComponent(videoInfo.url);
    const audioApiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodedUrl}`;
    
    const audioResponse = await axios.get(audioApiUrl);
    
    // Extract audio URL from response
    let audioUrl;
    if (audioResponse.data.download) {
      audioUrl = audioResponse.data.download;
    } else if (audioResponse.data.url) {
      audioUrl = audioResponse.data.url;
    } else if (audioResponse.data.link) {
      audioUrl = audioResponse.data.link;
    } else if (audioResponse.data.result?.download_url) {
      audioUrl = audioResponse.data.result.download_url;
    } else {
      audioUrl = audioApiUrl;
    }

    if (!audioUrl) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply("❌ *Could not fetch audio URL.* Please try again.");
    }

    const caption = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│   🎵 *MULAA SIGIL XMD*   │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🎬 *Title:* ${videoInfo.title}
⏱️ *Duration:* ${videoInfo.duration}
🔗 *Source:* YouTube

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
💜 *Powered by Mulaa Company*

*📢 Official Channel:*
https://whatsapp.com/channel/0029VbBdM812kNFhR12QdI2F`;

    // Send audio with FIXED channel button
    await malvin.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      caption: caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363363274139334@newsletter',
          newsletterName: "MULAA SIGIL XMD",
        },
        externalAdReply: {
          title: "📢 MULAA SIGIL XMD CHANNEL",
          body: "Click to join official channel",
          thumbnailUrl: videoInfo.thumbnail || "https://files.catbox.moe/rmv06k.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029VbBdM812kNFhR12QdI2F", // FIXED: This makes it clickable
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: mek });

    // Send thumbnail if available
    if (videoInfo.thumbnail) {
      await malvin.sendMessage(from, {
        image: { url: videoInfo.thumbnail },
        caption: `🎵 *${videoInfo.title}*\n⏱️ ${videoInfo.duration}\n\n> Powered by Mulaa Company ✨`
      }, { quoted: mek });
    }

    // Success reaction
    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

  } catch (error) {
    console.error("Play Command Error:", error);
    
    // Error reaction
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
    } catch {}
    
    const errorMsg = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│        ❌ *ERROR*         │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

*Error:* ${error.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
*📢 Join our channel:*
https://whatsapp.com/channel/0029VbBdM812kNFhR12QdI2F

> Powered by Mulaa Company ✨`;
    
    reply(errorMsg);
  }
});