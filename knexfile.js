const { db } = require('./.env');

module.exports = {
  client: 'postgresql',
  connection: db,
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
