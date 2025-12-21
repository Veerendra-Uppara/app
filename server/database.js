const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'chat.db');

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create messages table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        username TEXT NOT NULL,
        userId TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        imageUrl TEXT,
        messageType TEXT DEFAULT 'text'
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        reject(err);
        return;
      }
      
      // Add missing columns if they don't exist (for existing databases)
      db.run(`ALTER TABLE messages ADD COLUMN imageUrl TEXT`, () => {});
      db.run(`ALTER TABLE messages ADD COLUMN messageType TEXT DEFAULT 'text'`, () => {});
      
      console.log('Messages table ready');
      resolve(db);
    });
  });
}

// Save a message to the database
function saveMessage(db, messageData) {
  return new Promise((resolve, reject) => {
    const { message, username, userId, timestamp, imageUrl, messageType } = messageData;
    const sql = `INSERT INTO messages (message, username, userId, timestamp, imageUrl, messageType) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      message || null, 
      username, 
      userId, 
      timestamp || new Date().toISOString(),
      imageUrl || null,
      messageType || 'text'
    ], function(err) {
      if (err) {
        console.error('Error saving message:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, ...messageData });
      }
    });
  });
}

// Get message history
function getMessages(db, limit = 100) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?`;
    
    db.all(sql, [limit], (err, rows) => {
      if (err) {
        console.error('Error fetching messages:', err.message);
        reject(err);
      } else {
        // Reverse to get chronological order (oldest first)
        resolve(rows.reverse());
      }
    });
  });
}

// Get messages by user ID
function getMessagesByUserId(db, userId, limit = 100) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM messages WHERE userId = ? ORDER BY timestamp DESC LIMIT ?`;
    
    db.all(sql, [userId, limit], (err, rows) => {
      if (err) {
        console.error('Error fetching user messages:', err.message);
        reject(err);
      } else {
        resolve(rows.reverse());
      }
    });
  });
}

// Delete old messages (optional cleanup function)
function deleteOldMessages(db, daysOld = 30) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM messages WHERE timestamp < datetime('now', '-' || ? || ' days')`;
    
    db.run(sql, [daysOld], function(err) {
      if (err) {
        console.error('Error deleting old messages:', err.message);
        reject(err);
      } else {
        console.log(`Deleted ${this.changes} old messages`);
        resolve(this.changes);
      }
    });
  });
}

module.exports = {
  initDatabase,
  saveMessage,
  getMessages,
  getMessagesByUserId,
  deleteOldMessages,
  DB_PATH
};

