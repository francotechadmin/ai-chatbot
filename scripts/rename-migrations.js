const fs = require('fs');
const path = require('path');

// Path to the migrations directory
const migrationsDir = path.join(__dirname, '../lib/db/migrations');
// Path to the journal file
const journalPath = path.join(migrationsDir, 'meta/_journal.json');

// Read the journal file
const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));

// Get the existing migration files
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql') && !file.startsWith('.'));

// Create a mapping of index to tag from the journal
const indexToTag = {};
journal.entries.forEach(entry => {
  indexToTag[entry.idx] = entry.tag;
});

// Rename the files
migrationFiles.forEach(file => {
  const match = file.match(/^(\d{4})_/);
  if (match) {
    const index = parseInt(match[1], 10);
    const tag = indexToTag[index];
    
    if (tag) {
      const newFileName = `${tag}.sql`;
      const oldPath = path.join(migrationsDir, file);
      const newPath = path.join(migrationsDir, newFileName);
      
      if (file !== newFileName) {
        console.log(`Renaming ${file} to ${newFileName}`);
        fs.renameSync(oldPath, newPath);
      } else {
        console.log(`File ${file} already has the correct name`);
      }
    } else {
      console.log(`No tag found for index ${index}`);
    }
  }
});

console.log('Migration files renamed successfully');
