import * as dotenv from "dotenv";

dotenv.config();

export const dbConfig = {
    DEV: {
        client: process.env.DB_CLIENT ,
        connection: {
          host: process.env.DB_HOST ,
          port: Number(process.env.DB_PORT) ,
          user: process.env.DB_USER ,
          password: process.env.DB_PASSWORD,
          database: process.env.DATABASE ,
        },
        pool: { min: 2, max: 10 },
      },
      PROD: {
        client: process.env.DB_CLIENT,
        connection: {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER ,
          password: process.env.DB_PASSWORD ,
          database: process.env.DATABASE ,
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

