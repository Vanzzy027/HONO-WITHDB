// 
import { serve } from '@hono/node-server';
import { Hono, Context } from 'hono';
import { prometheus } from '@hono/prometheus';
import { rateLimiter } from 'hono-rate-limiter';
import pino from 'pino';
import booksRoute from './routes/books.route';
import { initDatabaseConnection } from './db/dbconfig';

// Logger setup
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

const app = new Hono();
const PORT = Number(process.env.PORT) || 5050;

// Prometheus metrics
const { printMetrics, registerMetrics } = prometheus({ prefix: 'hono_app_' });
app.use('*', registerMetrics);
app.get('/metrics', printMetrics);

// export default app;


      // Request logger
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`,
  });
});

      // Limiting the rate to avoid overload 
app.use(
  '*',
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20, //limits each ip to 20 requests to avoid overloading server with requests
    keyGenerator: (c) =>
      c.req.header('x-forwarded-for') ??
      c.req.header('host') ??
      'unknown-ip',
    message: 'Too many requests, please try again later.',
  })
);

// Routes
app.get('/', (c) => c.text('Hello Evans! Your Server is running successfully.'));
app.route('/books', booksRoute);
app.route('/api/books', booksRoute);




// Different way of error code respose
app.notFound((c: Context) =>
  c.json(
    {
      success: false,
      message: 'Route not found',
      path: c.req.path,
    },
    404
  )
);

// Start server after DB connection
// Here the server wont start untill the db
async function startServer() {
  try {
    logger.info('Attempting to connect to database...');
    await initDatabaseConnection();

    serve({ fetch: app.fetch, port: PORT }, (info) => {
      logger.info(`Server running at http://localhost:${info.port}`);
      logger.info('Metrics available at /metrics');
    });
  } catch (error) {
    logger.error('FATAL: Server failed to start due to database connection issue.', { error });
    console.error('Check environment variables and ensure MSSQL server is running.');
  }
}

startServer();


