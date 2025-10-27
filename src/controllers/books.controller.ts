import { Context } from 'hono';
import { bookService } from '../services/bookService';
import sql from 'mssql';
import { dbConnection } from '../db/dbconfig';

// // Get all or search
// export const getBooks = async (c: Context) => {
//   try {
//     const title = c.req.query('title');
//     const author = c.req.query('author');
//     const books = await bookService.search(title, author);
//     return c.json(books, 200);
//   } catch (error) {
//     console.error('Error fetching books:', error);
//     return c.json({ message: 'Internal server error' }, 500);
//   }
// };


// List all books
export const listBooks = async (c: Context) => {
  try {
    const pool = await sql.connect(dbConnection);
    const result = await pool.request().query('SELECT * FROM Books');
    return c.json(result.recordset);
  } catch (error) {
    console.error('Error fetching books:', error);
    return c.json({ success: false, message: 'Failed to fetch books' }, 500);
  }
};
// Get single
export const getBook = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ message: 'Invalid book ID' }, 400);

    const book = await bookService.getById(id);
    if (!book) return c.json({ message: 'Book not found' }, 404);

    return c.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
};

// Create
export const createBook = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { title, author, description, published, pages } = body;

    if (!title || !author || !description || !published || !pages) {
      return c.json({ message: 'All fields are required.' }, 400);
    }

    const newBook = await bookService.create({ title, author, description, published, pages });
    return c.json(newBook, 201);
  } catch (error) {
    console.error('Error creating book:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
};

// Update
export const updateBook = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ message: 'Invalid book ID' }, 400);

    const body = await c.req.json();
    const updated = await bookService.update(id, body);

    if (!updated) return c.json({ message: 'Book not found' }, 404);
    return c.json(updated);
  } catch (error) {
    console.error('Error updating book:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
};

// Delete
export const deleteBook = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ message: 'Invalid book ID' }, 400);

    const deleted = await bookService.remove(id);
    if (!deleted) return c.json({ message: 'Book not found' }, 404);

    return c.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
};












// import { Context } from 'hono';
// import sql from 'mssql';
// import { dbConnection } from '../db/dbConnection';

// // List all books
// export const listBooks = async (c: Context) => {
//   try {
//     const pool = await sql.connect(dbConnection);
//     const result = await pool.request().query('SELECT * FROM Books');
//     return c.json(result.recordset);
//   } catch (error) {
//     console.error('Error fetching books:', error);
//     return c.json({ success: false, message: 'Failed to fetch books' }, 500);
//   }
// };

// // Get single book by ID
// export const getBook = async (c: Context) => {
//   try {
//     const id = c.req.param('id');
//     const pool = await sql.connect(dbConnection);
//     const result = await pool.request()
//       .input('id', sql.Int, id)
//       .query('SELECT * FROM Books WHERE id = @id');

//     if (result.recordset.length === 0) {
//       return c.json({ success: false, message: 'Book not found' }, 404);
//     }

//     return c.json(result.recordset[0]);
//   } catch (error) {
//     console.error('Error fetching book:', error);
//     return c.json({ success: false, message: 'Error retrieving book' }, 500);
//   }
// };

// // Create book
// export const createBook = async (c: Context) => {
//   const body = await c.req.json();
//   const { title, author, year } = body;

//   try {
//     const pool = await sql.connect(dbConnection);
//     await pool.request()
//       .input('title', sql.NVarChar, title)
//       .input('author', sql.NVarChar, author)
//       .input('year', sql.Int, year)
//       .query('INSERT INTO Books (title, author, year) VALUES (@title, @author, @year)');
//     return c.json({ success: true, message: 'Book created successfully' });
//   } catch (error) {
//     console.error('Error creating book:', error);
//     return c.json({ success: false, message: 'Error creating book' }, 500);
//   }
// };

// // Update book
// export const updateBook = async (c: Context) => {
//   const id = c.req.param('id');
//   const body = await c.req.json();
//   const { title, author, year } = body;

//   try {
//     const pool = await sql.connect(dbConnection);
//     const result = await pool.request()
//       .input('id', sql.Int, id)
//       .input('title', sql.NVarChar, title)
//       .input('author', sql.NVarChar, author)
//       .input('year', sql.Int, year)
//       .query('UPDATE Books SET title=@title, author=@author, year=@year WHERE id=@id');

//     return c.json({ success: true, message: 'Book updated successfully' });
//   } catch (error) {
//     console.error('Error updating book:', error);
//     return c.json({ success: false, message: 'Error updating book' }, 500);
//   }
// };

// // Delete book
// export const deleteBook = async (c: Context) => {
//   const id = c.req.param('id');

//   try {
//     const pool = await sql.connect(dbConnection);
//     await pool.request()
//       .input('id', sql.Int, id)
//       .query('DELETE FROM Books WHERE id=@id');
//     return c.json({ success: true, message: 'Book deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting book:', error);
//     return c.json({ success: false, message: 'Error deleting book' }, 500);
//   }
// };
