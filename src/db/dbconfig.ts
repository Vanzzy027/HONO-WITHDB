import sql from 'mssql';
import 'dotenv/config';

// MSSQL DB Config
const sqlConfig = {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    server: process.env.DB_SERVER as string, // the DB server
    database: process.env.DB_DATABASE as string,
    port: parseInt(process.env.DB_PORT || '1433'),
    connectionTimeout: 15000,
    requestTimeout: 15000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

let pool: sql.ConnectionPool | null = null;

/**
 * Initializes and returns db connection pool.
 * Logs success or failure internally.
 * @returns {Promise<sql.ConnectionPool>} The connected pool.
 */
export const initDatabaseConnection = async (): Promise<sql.ConnectionPool> => {
    if (pool && pool.connected) {
        console.log('Using existing database connection');
        return pool;
    }

    try {
        pool = await sql.connect(sqlConfig);
        console.log('Connected to MSSQL Database');
        return pool;
    } catch (error) {
        console.error('Database Connection Failed!', error);
// Re-throw the error for the calling function  can handle it
        throw error;
    }
};

//Query execution function using the pool.
export const dbConnection = {
    execute: async (query: string, params: any[] = []): Promise<sql.IResult<any>> => {
        const currentPool = await initDatabaseConnection();
        const request = currentPool.request();

        // Add parameters  // Using positional parameters p0, p1, etc.
        params.forEach((param, index) => {
            
            request.input(`p${index}`, param);
        });

        const parameterizedQuery = query.replace(/\?/g, (match, offset, str) => {
            const paramIndex = str.slice(0, offset).split('?').length - 1;
            return `@p${paramIndex}`;
        });
        
        return request.query(parameterizedQuery);
    }
};


