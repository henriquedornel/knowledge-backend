const express = require('express');
const cors = require('cors');

module.exports = app => {
  //o app (instância do Express) será passado como parâmetro pelo Consign, e servirá como um centralizador de tudo vai ser usado na aplicação
  app.use(express.json());
  app.use(cors());
};
