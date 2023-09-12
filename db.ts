import { Database } from "bun:sqlite";

export interface Message {
  id?: number;
  content: string;
  author: string;
}

export class MessagesDatabase {
  private db: Database;

  constructor() {
    this.db = new Database("messages.db");
    // Initialize the database
    this.init()
      .then(() => console.log("Database initialized"))
      .catch(console.error);
  }

  // Get all messages
  async getMessages() {
    return this.db.query("SELECT * FROM messages").all();
  }

  // Get a single message by id
  async getMessage(id: number) {
    return this.db.query(`SELECT * FROM messages WHERE id = ${id}`).get();
  }

  // Add a message
  async addMessage(message: Message) {
    // q: Get id type safely
    return this.db
      .query(`INSERT INTO messages (content) VALUES (?) RETURNING id`)
      .get(message.content) as Message;
  }

  // Update a message
  async updateMessage(id: number, message: Message) {
    return this.db.run(
      `UPDATE messages SET content = '${message.content}' WHERE id = ${id}`
    );
  }

  // Delete a message
  async deleteMessage(id: number) {
    return this.db.run(`DELETE FROM messages WHERE id = ${id}`);
  }

  // Initialize the database
  async init() {
    return this.db.run(
      "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)"
    );
  }
}
