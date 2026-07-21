// config.js
const fs = require('fs');
const path = require('path');

// Load config from JSON file
let configData = {};
const configFile = path.join(__dirname, 'config.json');

try {
  if (fs.existsSync(configFile)) {
    const fileContent = fs.readFileSync(configFile, 'utf-8');
    configData = JSON.parse(fileContent);
    console.log('✅ Config loaded from config.json');
    
    // Log what was loaded (without showing full session)
    console.log(`   • Owner: ${configData.OWNER_NAME || 'Not set'}`);
    console.log(`   • Bot: ${configData.BOT_NAME || 'Not set'}`);
    console.log(`   • Prefix: ${configData.PREFIX || '.'}`);
    console.log(`   • Session: ${configData.SESSION_ID ? '✅ Present' : '❌ Missing'}`);
  } else {
    console.log('⚠️ config.json not found, creating default config...');
    
    // Create default config if it doesn't exist
    const defaultConfig = {
      OWNER_NUMBER: '26775462914',
      OWNER_NAME: 'Mulax Prime',
      BOT_NAME: 'MULAA SIGIL XMD',
      PREFIX: '.',
      MODE: 'public',
      AUTO_READ: false,
      AUTO_STATUS_READ: false,
      REJECT_CALL: false,
      SESSION_ID: ''
    };
    
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Default config.json created');
    configData = defaultConfig;
  }
} catch (e) {
  console.log('❌ Error loading config.json:', e.message);
  
  // If JSON is corrupted, create backup and use defaults
  if (fs.existsSync(configFile)) {
    try {
      const backupFile = path.join(__dirname, 'config.backup.json');
      fs.copyFileSync(configFile, backupFile);
      console.log('⚠️ Corrupted config backed up to config.backup.json');
    } catch (backupError) {
      console.log('❌ Failed to create backup:', backupError.message);
    }
  }
}

// Export with defaults
module.exports = {
  // Owner information
  OWNER_NUMBER: configData.OWNER_NUMBER || '26775462914',
  OWNER_NAME: configData.OWNER_NAME || 'Mulax Prime',
  
  // Bot configuration
  BOT_NAME: configData.BOT_NAME || 'MULAA SIGIL XMD',
  PREFIX: configData.PREFIX || '.',
  MODE: configData.MODE || 'public',
  
  // Feature toggles
  AUTO_READ: configData.AUTO_READ === true, // Ensure boolean
  AUTO_STATUS_READ: configData.AUTO_STATUS_READ === true,
  REJECT_CALL: configData.REJECT_CALL === true,
  
  // Session (can be empty for QR code)
  SESSION_ID: configData.SESSION_ID || '',
  
  // Helper function to check if session exists
  hasSession: () => !!(configData.SESSION_ID && configData.SESSION_ID.length > 0),
  
  // Helper function to get config as object
  getAll: () => ({
    OWNER_NUMBER: configData.OWNER_NUMBER || '26775462914',
    OWNER_NAME: configData.OWNER_NAME || 'Mulax Prime',
    BOT_NAME: configData.BOT_NAME || 'MULAA SIGIL XMD',
    PREFIX: configData.PREFIX || '.',
    MODE: configData.MODE || 'public',
    AUTO_READ: configData.AUTO_READ === true,
    AUTO_STATUS_READ: configData.AUTO_STATUS_READ === true,
    REJECT_CALL: configData.REJECT_CALL === true,
    hasSession: !!(configData.SESSION_ID && configData.SESSION_ID.length > 0)
  })
};
