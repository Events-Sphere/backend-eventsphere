import knex from 'knex';
import { dbConfig } from '../Config/knex-config';
import * as dotenv from "dotenv";

dotenv.config();


const NODE_ENV = process.env.NODE_ENV || 'DEV';
const ENVIRONMENT = NODE_ENV === 'DEV' ? dbConfig.DEV : NODE_ENV === 'PROD' ? dbConfig.PROD : dbConfig.STAGING;

const db = knex(ENVIRONMENT);

export const connectToDatabase = async () => {
    try {
      await db.raw('SELECT 1');
      console.log(
        '✨ Database connection established successfully! Your app is ready to query the database.'
      );
    } catch (error) {
      console.error(
        '❌ Database connection failed! Please check the following:\n' +
        `🔹 ${error}\n` +
        '🔹 Ensure your database is running and the configuration is correct.'
      );
      process.exit(1);
    }
  };

export default db;
