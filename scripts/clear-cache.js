// Clear Next.js cache and restart cleanly
const fs = require('fs');
const path = require('path');

console.log('Clearing Next.js caches...');

// Clear .next directory
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✓ Cleared .next directory');
}

// Clear node_modules/.cache if it exists
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✓ Cleared node_modules/.cache');
}

console.log('\nCache cleared! Please restart your development server with:');
console.log('npm run dev');