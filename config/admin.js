module.exports = middleware => {
  return (req, res, next) => {
    if (req.user.admin) {
      middleware(req, res, next);
    } else {
      res.status(401).send('Usuário não é administrador.'); //código de erro para acesso não autorizado
    }
  };
};
