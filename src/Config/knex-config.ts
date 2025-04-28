import * as dotenv from "dotenv";

dotenv.config();

export const knexConfig = {
    DEV: {
        client: process.env.DEV_DB_CLIENT ,
        connection: {
          host: process.env.DEV_DB_HOST ,
          port: Number(process.env.DEV_DB_PORT) ,
          user: process.env.DEV_DB_USER ,
          password: process.env.DEV_DB_PASSWORD,
          database: process.env.DEV_DATABASE ,
        },
        pool: { min: 2, max: 10 },
      },
      PROD: {
        client: process.env.PROD_DB_CLIENT,
        connection: {
          host: process.env.PROD_DB_HOST,
          port: Number(process.env.PROD_DB_PORT),
          user: process.env.PROD_DB_USER ,
          password: process.env.PROD_DB_PASSWORD ,
          database: process.env.PROD_DATABASE ,
        },
        pool: { min: 2, max: 10 },
      },
      STAGING: {
        client: process.env.DB_CLIENT,
        connection: {
          host: process.env.DB_HOST ,
          port: Number(process.env.DB_PORT) ,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD ,
          database: process.env.DATABASE ,
        },
        pool: { min: 2, max: 10 },
      }
};

