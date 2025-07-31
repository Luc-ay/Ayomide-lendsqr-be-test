import type { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: process.env.DB_URL,
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },

  production: {
    client: 'mysql2',
    connection: process.env.DB_URL,
    migrations: {
      tableName: 'knex_migrations',
      directory: './dist/db/migrations',
    },
    seeds: {
      directory: './dist/db/seeds',
    },
  },
}
export default config
