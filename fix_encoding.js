const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const buf = fs.readFileSync(fullPath);
      if (buf[0] === 0xFF && buf[1] === 0xFE) {
        const str = buf.toString('utf16le');
        fs.writeFileSync(fullPath, str, 'utf8');
        console.log(`Converted: ${fullPath}`);
      }
    }
  }
}

processDir('C:/Users/L9IIRCH/Desktop/ReserverDark/client/src');
