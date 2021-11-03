const config = require('../knexfile.js');
const knex = require('knex')(config);

knex.migrate.latest([config]); //para rodar automaticamente até a última migração do Knex ao carregar a aplicação, com "npm start" ou "npm production" (em sistemas pequenos fazer assim não causa problemas, por não haver preocupações com balanceamento de carga por exemplo)

module.exports = knex;
