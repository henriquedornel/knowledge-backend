const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL + process.env.DATABASE_URL_OPTIONS,
  pool: {
    min: 2,
    max: 10,
    propagateCreateError: false,
  },
  migrations: {
    tableName: '_knex_migrations',
    directory: './database/migrations',
  },
};
