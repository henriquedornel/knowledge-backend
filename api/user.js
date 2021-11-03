const bcrypt = require('bcrypt-nodejs');

module.exports = app => {
  const { existsOrError, notExistsOrError, equalsOrError } = app.utils.validate;

  const encryptPassword = password => {
    const salt = bcrypt.genSaltSync(10); //o hash gerado será diferente para a mesma senha
    return bcrypt.hashSync(password, salt); //gera o hash da senha de forma síncrona
  };

  const save = async (req, res) => {
    const user = { ...req.body }; //objeto gerado pelo body-parser
    if (req.params.id) user.id = req.params.id; //quando for um update

    if (!req.originalUrl.startsWith('/users')) user.admin = false; //para prevenir que um usuário se cadastre como administrador, verificando se a URL de origem é "/users"
    if (!req.user || !req.user.admin) user.admin = false; //se não houver usuário logado ou se o usuário logado não é administrador

    try {
      existsOrError(user.name, 'Nome não informado');
      existsOrError(user.email, 'E-mail não informado');
      existsOrError(user.password, 'Senha não informada');
      existsOrError(user.confirmPassword, ' Confirmação de Senha inválida');
      equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem');

      const userFromDB = await app
        .db('users')
        .where({ email: user.email })
        .first();
      if (!user.id) {
        notExistsOrError(userFromDB, 'Usuário já cadastrado');
      }
    } catch (msg) {
      return res.status(400).send(msg); //erro do lado do cliente
    }

    user.password = encryptPassword(user.password);
    delete user.confirmPassword;

    if (user.id) {
      //update
      app
        .db('users')
        .update(user)
        .where({ id: user.id })
        .whereNull('deletedAt')
        .then(_ => res.status(204).send()) //não ocorreu nenhum erro
        .catch(err => res.status(500).send(err)); //erro do lado do servidor
    } else {
      //insert
      app
        .db('users')
        .insert(user)
        .then(_ => res.status(204).send()) //não ocorreu nenhum erro
        .catch(err => res.status(500).send(err)); //erro do lado do servidor
    }
  };

  const get = (req, res) => {
    //trazer todos os usuários
    app
      .db('users')
      .select('id', 'name', 'email', 'admin')
      .whereNull('deletedAt')
      .then(users => res.json(users)) //caso os nomes dos campos no banco de dados seguissem o padrão under_scores, aqui seria necessário fazer um map para converter para o padrão camelCase, para ser compatível com o padrão REST e com as nomenclaturas do frontend
      .catch(err => res.status(500).send(err)); //erro do lado do servidor
  };

  const getById = (req, res) => {
    //trazer um usuário específico
    app
      .db('users')
      .select('id', 'name', 'email', 'admin')
      .where({ id: req.params.id })
      .whereNull('deletedAt')
      .first()
      .then(user => res.json(user))
      .catch(err => res.status(500).send(err));
  };

  const remove = async (req, res) => {
    try {
      const articles = await app
        .db('articles')
        .where({ userId: req.params.id });
      notExistsOrError(articles, 'Usuário possui artigos.');

      const rowsUpdated = await app
        .db('users')
        .update({ deletedAt: newDate() })
        .where({ id: req.params.id });
      existsOrError(rowsUpdated, 'Usuário não foi encontrado.');

      res.status(204).send();
    } catch (msg) {
      res.status(400).send(msg);
    }
  };

  return { save, get, getById, remove };
};
