import * as process from 'process';
import * as dotenv from 'dotenv';

dotenv.config();

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
  },
});
