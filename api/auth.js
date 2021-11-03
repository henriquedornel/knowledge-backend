const { authSecret } = require('../.env');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

module.exports = app => {
  const signin = async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send('Informe usuário e senha!');
    }

    const user = await app.db('users').where({ email: req.body.email }).first();

    if (!user) return res.status(400).send('Usuário não encontrado!');

    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) return res.status(401).send('Email/Senha inválidos!'); //código de erro para acesso não autorizado

    //Date.now() -> quantidade de milissegundos desde 01/01/1970
    //Date.now() / 1000 -> quantidade de segundos desde 01/01/1970 (valor quebrado)
    //Math.floor(Date.now() / 1000) -> quantidade de segundos desde 01/01/1970 (valor inteiro)
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      iat: now, //issued at (emitido em)
      exp: now + 60 * 60 * 24 * 3, //token será válido por 3 dias
    };

    res.json({
      ...payload,
      token: jwt.encode(payload, authSecret),
    });
  };

  const validateToken = async (req, res) => {
    const userData = req.body || null;
    try {
      if (userData) {
        const token = jwt.decode(userData.token, authSecret);
        if (new Date(token.exp * 1000) > new Date()) {
          //no JavaScript o tempo é em milissegundos, e o no token o tempo é em segundos
          return res.send(true); //aqui poderíamos também renovar o token do usuário
        }
      }
    } catch (e) {
      // problema com o token
    }

    res.send(false);
  };

  return { signin, validateToken };
};
