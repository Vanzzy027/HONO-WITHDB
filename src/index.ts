import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import booksRoute from './routes/books.route'; // Assuming you use .ts extension here
import { initDatabaseConnection } from './db/dbconfig'; // Assuming you use .ts extension here

const app = new Hono();
const PORT = 5050;

// API for a welcome message
app.get('/', (c) => {
    return c.text('Hello Evans! Server is running.');
});

// Connect the books routes
app.route('/books', booksRoute);
app.route('/api/books', booksRoute);


/**
 * Main function to initialize database and start the server.
 * This ensures the server only starts if the DB connection succeeds.
 */
async function startServer() {
    try {
        console.log('Attempting to connect to database...');
        // WAIT for the database connection attempt to complete.
        await initDatabaseConnection();

        // If the connection is successful, start the server.
        serve({
            fetch: app.fetch,
            port: PORT
        }, (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        });

    } catch (error) {
        // If initDatabaseConnection throws an error, we catch it here and log a fatal message.
        // The server will not start if the connection fails.
        console.error('FATAL ERROR: Server failed to start due to database connection issue.', error);
        console.log('Please check your environment variables and ensure your MSSQL server is running and accessible.');
    }
}

// Execute the main startup function
startServer();
