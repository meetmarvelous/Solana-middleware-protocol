const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../../packages/typescript-config');
const dest = path.resolve(__dirname, 'node_modules/@repo/typescript-config');

if (fs.existsSync(src)) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    fs.cpSync(src, dest, { recursive: true });
    console.log('Successfully copied typescript-config to node_modules');
  } catch (err) {
    console.error('Failed to copy typescript-config:', err.message);
  }
} else {
  console.log('Source typescript-config not found, skipping copy.');
}
