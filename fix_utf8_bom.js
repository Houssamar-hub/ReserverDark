const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let buf = fs.readFileSync(fullPath);
      // If it's UTF-16LE (FF FE)
      if (buf[0] === 0xFF && buf[1] === 0xFE) {
        // Read as string (this removes the BOM because we slice 2 bytes)
        let str = buf.slice(2).toString('utf16le');
        // Write as UTF-8 with BOM
        fs.writeFileSync(fullPath, '\uFEFF' + str, 'utf8');
        console.log(`Converted UTF-16LE to UTF-8 (with BOM): ${fullPath}`);
      }
    }
  }
}

processDir('C:/Users/L9IIRCH/Desktop/ReserverDark/client/src');
