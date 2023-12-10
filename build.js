// Assuming Node.js environment for the build script

const fs = require('fs');

// Read the original translation file
const originalTranslationFilePath = '.cache/admin/public/locales/en/translation.json';
const originalTranslationData = JSON.parse(fs.readFileSync(originalTranslationFilePath, 'utf8'));

// Override constants
originalTranslationData["login-card-log-in-to-medusa"] = "Login to The Adam's Edition";
// Add more overrides as needed

// Write the modified translation file to the build directory
const buildTranslationFilePath = '.cache/admin/public/locales/en/translation.json';
fs.writeFileSync(buildTranslationFilePath, JSON.stringify(originalTranslationData, null, 2), 'utf8');

// Other build tasks...