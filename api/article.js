const queries = require('../utils/queries');

module.exports = app => {
  const { existsOrError } = app.utils.validate;

  const save = (req, res) => {
    const article = { ...req.body }; //objeto gerado pelo body-parser
    if (req.params.id) article.id = req.params.id; //quando for um update

    try {
      existsOrError(article.name, 'Nome não informado');
      existsOrError(article.description, 'Descrição não informada');
      existsOrError(article.categoryId, 'Categoria não informada');
      existsOrError(article.userId, 'Autor não informado');
      existsOrError(article.content, 'Conteúdo não informado');
    } catch (msg) {
      return res.status(400).send(msg); //erro do lado do cliente
    }

    if (article.id) {
      //update
      app
        .db('articles')
        .update(article)
        .where({ id: article.id })
        .then(_ => res.status(204).send()) //não ocorreu nenhum erro
        .catch(err => res.status(500).send(err)); //erro do lado do servidor
    } else {
      //insert
      app
        .db('articles')
        .insert(article)
        .then(_ => res.status(204).send()) //não ocorreu nenhum erro
        .catch(err => res.status(500).send(err)); //erro do lado do servidor
    }
  };

  const remove = async (req, res) => {
    try {
      const rowsDeleted = await app
        .db('articles')
        .where({ id: req.params.id })
        .del();

      try {
        existsOrError(rowsDeleted, 'Artigo não foi encontrado.');
      } catch (msg) {
        return res.status(400).send(msg); //erro do lado do cliente
      }

      res.status(204).send(); //não ocorreu nenhum erro
    } catch (msg) {
      res.status(50).send(msg); //erro do lado do servidor
    }
  };

  const limit = 10; //usado para paginação
  const get = async (req, res) => {
    //trazer todos os artigos
    const page = req.query.page || 1; //página 1 como padrão

    const result = await app.db('articles').count('id').first();
    const count = parseInt(result.count);

    app
      .db('articles')
      .select('id', 'name', 'description')
      .limit(limit)
      .offset(page * limit - limit) //deslocamento necessário para trazer os dados paginados
      .then(articles => res.json({ data: articles, count, limit })) //além dos artigos, o frontend vai receber também o count e o limit
      .catch(err => res.status(500).send(err)); //erro do lado do servidor
  };

  const getById = (req, res) => {
    //trazer um artigo específico
    app
      .db('articles')
      .where({ id: req.params.id })
      .first()
      .then(article => {
        article.content = article.content.toString(); //para converter de binário para string
        return res.json(article);
      })
      .catch(err => res.status(500).send(err));
  };

  const getByCategory = async (req, res) => {
    //para trazer também os artigos das categorias filhas ao clicar em uma categoria do menu no frontend
    const categoryId = req.params.id;
    const page = req.query.page || 1;
    const categories = await app.db.raw(
      queries.categoryWithChildren,
      categoryId,
    ); //executar uma query externa
    const ids = categories.rows.map(c => c.id); //array com os ids das categorias (tanto da categoria pai quanto das categorias filhas)

    app
      .db({ a: 'articles', u: 'users' }) //consulta em mais de uma tabela, para trazer também o nome do autor do artigo
      .select('a.id', 'a.name', 'a.description', 'a.imageUrl', {
        author: 'u.name',
      }) //virtualField
      .limit(limit)
      .offset(page * limit - limit)
      .whereRaw('?? = ??', ['u.id', 'a.userId'])
      .whereIn('categoryId', ids) //select * from articles where "categoryId" in (4, 5, 6, 7, 8)
      .orderBy('a.id', 'desc')
      .then(articles => res.json(articles))
      .catch(err => res.status(500).send(err)); //erro do lado do servidor
  };

  return { save, remove, get, getById, getByCategory };
};
