const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/thenam.db');
console.log('Media count:', db.prepare('SELECT COUNT(*) as c FROM media').get().c);
console.log('Site settings count:', db.prepare('SELECT COUNT(*) as c FROM site_settings').get().c);
console.log('Sample media:', db.prepare('SELECT id, filename, url, width, height, file_size FROM media LIMIT 3').all());
