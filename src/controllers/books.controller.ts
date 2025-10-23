import { Context } from 'hono';
import { dbConnection } from '../db/dbconfig';
import sql from 'mssql'; // Import sql module for type checking

// Define a type for your book data
type Book = {
  id: number;
  title: string;
  author: string;
  description?: string;
  published?: string;
  pages?: number;
};

// Input type for creating/updating books (no id required)
type BookInput = Omit<Book, 'id'>;


/**
 * GET handler to fetch books, supporting search by title or author via query parameters.
 */
export const getBooks = async (c: Context) => {
    try {
        // 1. Get query parameters from the request URL
        const titleQuery = c.req.query('title');
        const authorQuery = c.req.query('author');

        let query = 'SELECT * FROM Books';
        const params: (string | number)[] = [];
        const conditions: string[] = [];

        // 2. Build the WHERE clause dynamically
        if (titleQuery) {
            // Use LIKE for partial, case-insensitive searching in MSSQL
            conditions.push('title LIKE ?');
            // The parameter must include wildcards (%) for LIKE to work as search
            params.push(`%${titleQuery}%`);
        }

        if (authorQuery) {
            conditions.push('author LIKE ?');
            params.push(`%${authorQuery}%`);
        }

        // 3. Combine conditions if they exist
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        // Always add an ORDER BY clause for consistent results
        query += ' ORDER BY id ASC';

        // 4. Execute the query
        const result = await dbConnection.execute(query, params);

        // 5. Return the results
        return c.json(result.recordset, 200);

    } catch (error) {
        console.error('Error fetching books:', error);
        return c.json({ message: 'Internal server error while fetching books.' }, 500);
    }
};




// List all books
export const listBooks = async (c: Context) => {
    try {
        const result = await dbConnection.execute('SELECT * FROM Books');
        return c.json(result.recordset);
    } catch (error) {
        console.error('Error fetching books:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
};

// Get a single book by ID
export const getBook = async (c: Context) => {
    try {
        const id = Number(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ message: 'Invalid book ID' }, 400);
        }

        const result = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [id]);
        const book = result.recordset[0];

        if (!book) {
            return c.json({ message: 'Book not found' }, 404);
        }
        return c.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
};



// Create a new book
export const createBook = async (c: Context) => {
    try {
        // Explicitly cast the request body for safety
        const body = (await c.req.json()) as BookInput;
        const { title, author, description, published, pages } = body;

        // 1. Validation Check
        if (!title || !author || !pages || !description || !published) {
            // Use Hono's c.json for consistent JSON response
            return c.json({ message: 'All fields (title, author, description, published, pages) are required.' }, 400);
        }

        // 2. Prepare the robust INSERT query using OUTPUT INSERTED.*
        // This is the MSSQL standard way to return the newly created record.
        const query = `
            INSERT INTO Books (title, author, description, published, pages)
            OUTPUT INSERTED.*
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const params = [
            title, 
            author, 
            description, 
            published, // Ensure this matches the date format/type of your SQL column
            pages
        ];

        // 3. Execute the query
        const result = await dbConnection.execute(query, params);

        // 4. Check for record set existence and return the new book
        if (result.recordset.length === 0) {
            console.error('Insert failed to return the inserted record.');
            return c.json({ message: 'Book created but failed to retrieve record.' }, 500);
        }
        
        // The newly created book record is the first element of the recordset
        return c.json(result.recordset[0], 201);

    } catch (error) {
        // Log the error for server-side debugging
        console.error('Error creating book:', error);

        // Check for common SQL errors (like foreign key constraint or data type error)
        let message = 'Internal server error while creating the book.';
        
        // You can inspect the error object further here if needed (e.g., error.code)
        
        return c.json({ message: message }, 500);
    }
};



// // Create a new book
// export const createBook = async (c: Context) => {
//     try {
//         const body = await c.req.json();
//         const { title, author, description, published, pages } = body;

//         if (!title || !author ||!pages ||!description ||!published) {
//             return c.json({ message: 'All inputs are required' }, 400);
//         }
        
//         // Use a single query to insert and get the ID
//         const query = 'INSERT INTO Books (title, author, description, published, pages) VALUES (?, ?, ?, ?, ?); SELECT SCOPE_IDENTITY() AS id;';
//         const result = await dbConnection.execute(
//             query,
//             [title, author, description, published, pages]
//         );

//         const newBookId = result.recordset[0].id;

//         // Fetch the newly created book
//         const newBookResult = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [newBookId]);
        
//         return c.json(newBookResult.recordset[0], 201);

//     } catch (error) {
//         console.error('Error creating book:', error);
//         return c.json({ message: 'Internal server error' }, 500);
//     }
// };

// Update an existing book
export const updateBook = async (c: Context) => {
    try {
        const id = Number(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ message: 'Invalid book ID' }, 400);
        }

        const body = await c.req.json();
        const { title, author, description, published, pages } = body;

        const result = await dbConnection.execute(
            'UPDATE Books SET title = ?, author = ?, description = ?, published = ?, pages = ? WHERE id = ?',
            [title, author, description, published, pages, id]
        );

        if (result.rowsAffected[0] === 0) {
            return c.json({ message: 'Book not found' }, 404);
        }

        const updatedBookResult = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [id]);
        return c.json(updatedBookResult.recordset[0]);
        
    } catch (error) {
        console.error('Error updating book:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
};

// Delete a book
export const deleteBook = async (c: Context) => {
    try {
        const id = Number(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ message: 'Invalid book ID' }, 400);
        }
        
        const result = await dbConnection.execute('DELETE FROM Books WHERE id = ?', [id]);

        if (result.rowsAffected[0] === 0) {
            return c.json({ message: 'Book not found' }, 404);
        }

        return c.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
};



// import { Context } from 'hono';
// import { dbConnection } from '../db/dbconfig';

// // Define a type for your book data
// type Book = {
//   id: number;
//   title: string;
//   author: string;
//   description?: string;
//   published?: string;
//   pages?: number;
// };

// // List all books
// export const listBooks = async (c: Context) => {
//     try {
//         const result = await dbConnection.execute('SELECT * FROM Books');
//         return c.json(result.recordset);
//     } catch (error) {
//         console.error('Error fetching books:', error);
//         return c.json({ message: 'Internal server error' }, 500);
//     }
// };

// // Get a single book by ID
// export const getBook = async (c: Context) => {
//     try {
//         const id = Number(c.req.param('id'));
//         if (isNaN(id)) {
//             return c.json({ message: 'Invalid book ID' }, 400);
//         }

//         const result = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [id]);
//         const book = result.recordset[0];

//         if (!book) {
//             return c.json({ message: 'Book not found' }, 404);
//         }
//         return c.json(book);
//     } catch (error) {
//         console.error('Error fetching book:', error);
//         return c.json({ message: 'Internal server error' }, 500);
//     }
// };

// // Create a new book
// export const createBook = async (c: Context) => {
//     try {
//         const body = await c.req.json();
//         const { title, author, description, published, pages } = body;

//         if (!title || !author) {
//             return c.json({ message: 'title and author are required' }, 400);
//         }

//         const query = 'INSERT INTO Books (title, author, description, published, pages) VALUES (?, ?, ?, ?, ?); SELECT SCOPE_IDENTITY() AS id;';
//         const result = await dbConnection.execute(
//             query,
//             [title, author, description, published, pages]
//         );

//         const newBookId = result.recordset[0].id;
//         const newBookResult = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [newBookId]);
        
//         return c.json(newBookResult.recordset[0], 201);

//     } catch (error) {
//         console.error('Error creating book:', error);
//         return c.json({ message: 'Internal server error' }, 500);
//     }
// };

// // Update an existing book
// export const updateBook = async (c: Context) => {
//     try {
//         const id = Number(c.req.param('id'));
//         if (isNaN(id)) {
//             return c.json({ message: 'Invalid book ID' }, 400);
//         }

//         const body = await c.req.json();
//         const { title, author, description, published, pages } = body;

//         const result = await dbConnection.execute(
//             'UPDATE Books SET title = ?, author = ?, description = ?, published = ?, pages = ? WHERE id = ?',
//             [title, author, description, published, pages, id]
//         );

//         if (result.rowsAffected[0] === 0) {
//             return c.json({ message: 'Book not found' }, 404);
//         }

//         const updatedBookResult = await dbConnection.execute('SELECT * FROM Books WHERE id = ?', [id]);
//         return c.json(updatedBookResult.recordset[0]);
        
//     } catch (error) {
//         console.error('Error updating book:', error);
//         return c.json({ message: 'Internal server error' }, 500);
//     }
// };

// // Delete a book
// export const deleteBook = async (c: Context) => {
//     try {
//         const id = Number(c.req.param('id'));
//         if (isNaN(id)) {
//             return c.json({ message: 'Invalid book ID' }, 400);
//         }
        
//         const result = await dbConnection.execute('DELETE FROM Books WHERE id = ?', [id]);

//         if (result.rowsAffected[0] === 0) {
//             return c.json({ message: 'Book not found' }, 404);
//         }

//         return c.json({ message: 'Book deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting book:', error);
//         return c.json({ message: 'Internal server error' }, 500);
//     }
// };
