import { dbConnection } from '../db/dbconfig';

// Define types
export type Book = {
  id: number;
  title: string;
  author: string;
  description?: string;
  published?: string;
  pages?: number;
};

export type BookInput = Omit<Book, 'id'>;

// Service Functions
export const bookService = {
  async getAll(): Promise<Book[]> {
    const result = await dbConnection.execute('SELECT * FROM Books ORDER BY id ASC');
    return result.recordset;
  },

  async getById(id: number): Promise<Book | null> {
    const result = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [id]);
    return result.recordset[0] || null;
  },

  async search(title?: string, author?: string): Promise<Book[]> {
    let query = 'SELECT * FROM Books';
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (title) {
      conditions.push('title LIKE ?');
      params.push(`%${title}%`);
    }

    if (author) {
      conditions.push('author LIKE ?');
      params.push(`%${author}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const result = await dbConnection.execute(query, params);
    return result.recordset;
  },

  async create(data: BookInput): Promise<Book> {
    const { title, author, description, published, pages } = data;

    const query = `
      INSERT INTO Books (title, author, description, published, pages)
      OUTPUT INSERTED.*
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await dbConnection.execute(query, [
      title, author, description, published, pages
    ]);

    return result.recordset[0];
  },

  async update(id: number, data: BookInput): Promise<Book | null> {
    const { title, author, description, published, pages } = data;

    const result = await dbConnection.execute(
      'UPDATE Books SET title=?, author=?, description=?, published=?, pages=? WHERE id=?',
      [title, author, description, published, pages, id]
    );

    if (result.rowsAffected[0] === 0) return null;

    const updated = await dbConnection.execute('SELECT * FROM Books WHERE id=?', [id]);
    return updated.recordset[0];
  },

  async remove(id: number): Promise<boolean> {
    const result = await dbConnection.execute('DELETE FROM Books WHERE id=?', [id]);
    return result.rowsAffected[0] > 0;
  }
};
