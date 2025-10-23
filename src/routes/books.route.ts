import { Hono } from 'hono';
import { listBooks, getBook, createBook, updateBook, deleteBook } from '../controllers/books.controller';


const booksRoute = new Hono();

// Routes for both /books and /api/books
booksRoute.get('/', listBooks);
booksRoute.post('/', createBook);
booksRoute.get('/:id', getBook);
booksRoute.put('/:id', updateBook);
booksRoute.delete('/:id', deleteBook);

export default booksRoute;
