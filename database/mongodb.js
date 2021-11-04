const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .catch(e => {
    const msg = 'ERRO! Não foi possível conectar com o MongoDB!';
    console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m'); //para a mensagem de erro ficar com a fonte branca e o fundo vermelho no terminal
  });
