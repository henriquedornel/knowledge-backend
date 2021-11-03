const app = require('express')();
const consign = require('consign'); //ajuda a gerenciar as dependências dentro da aplicação (para não precisar fazer o require de todos os arquivos)

const db = require('./database/db');
app.db = db;

require('./database/mongodb');
const mongoose = require('mongoose');
app.mongoose = mongoose;

consign()
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./utils/validate.js')
  .then('./api') //carrega todos os arquivos dentro da pasta
  .then('./tasks')
  .then('./config/routes.js') //as rotas só serão carregadas depois que as APIs já tiverem sido carregadas
  .into(app);

app.listen(3001, () => {
  console.log('Backend executanto...');
});
