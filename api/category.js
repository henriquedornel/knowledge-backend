module.exports = app => {
  const { existsOrError, notExistsOrError } = app.utils.validate;

  const save = (req, res) => {
    const category = {
      id: req.body.id,
      name: req.body.name,
      parentId: req.body.parentId,
    };

    if (req.params.id) category.id = req.params.id; //quando for um update

    try {
      existsOrError(category.name, 'Nome não informado');
    } catch (msg) {
      return res.status(400).send(msg); //erro do lado do cliente
    }

    if (category.id) {
      //update
      app
        .db('categories')
        .update(category)
        .where({ id: category.id })
        .then(_ => res.status(204).send()) //não ocorreu nenhum erro
        .catch(err => res.status(500).send(err)); //erro do lado do servidor
    } else {
      //insert
      app
        .db('categories')
        .insert(category)
        .then(_ => res.status(204).send()) //não ocorreu nenhum erro
        .catch(err => res.status(500).send(err)); //erro do lado do servidor
    }
  };

  const remove = async (req, res) => {
    try {
      existsOrError(req.params.id, 'Código da Categoria não informado.');

      const subcategory = await app
        .db('categories')
        .where({ parentId: req.params.id });
      notExistsOrError(subcategory, 'Categoria possui subcategorias.');

      const articles = await app
        .db('articles')
        .where({ categoryId: req.params.id });
      notExistsOrError(articles, 'Categoria possui artigos.');

      const rowsDeleted = await app
        .db('categories')
        .where({ id: req.params.id })
        .del();
      existsOrError(rowsDeleted, 'Categoria não foi encontrada');

      res.status(204).send(); //não ocorreu nenhum erro
    } catch (msg) {
      res.status(400).send(msg); //erro do lado do cliente
    }
  };

  const withPath = categories => {
    //virtualField
    const getParent = (categories, parentId) => {
      const parent = categories.filter(parent => parent.id === parentId);
      return parent.length ? parent[0] : null;
    };

    categoriesWithPath = categories.map(category => {
      let path = category.name;
      let parent = getParent(categories, category, parentId);

      while (parent) {
        path = `${parent.name} > ${path}`;
        parent = getParent(categories, parent.parentId);
      }

      return { ...category, path };
    });

    categoriesWithPath.sort((a, b) => {
      //para manter em ordem alfabética ordenando pelo path
      if (a.path < b.path) return -1;
      if (a.path > b.path) return 1;
      return 0;
    });

    return categoriesWithPath;
  };

  const get = (req, res) => {
    //trazer todos as categorias
    app
      .db('categories') //se for trazer tudo, não precisa do select
      .then(categories => res.json(withPath(categories)))
      .catch(err => res.status(500).send(err)); //erro do lado do servidor
  };

  const getById = (req, res) => {
    //trazer uma categoria específica
    app
      .db('categories')
      .where({ id: req.params.id })
      .first()
      .then(category => res.json(category))
      .catch(err => res.status(500).send(err));
  };

  const toTree = (categories, tree) => {
    //para montar árvore do menu de categorias no frontend
    if (!tree) tree = categories.filter(c => !c.parentId); //somente as categorias que não tem parent
    tree = tree.map(parentNode => {
      const isChild = node => node.parentId == parentNode.id;
      parentNode.children = toTree(categories, categories.filter(isChild));
      return parentNode;
    });
    return tree;
  }; //TO DO: no frontend, atualizar o menu automaticamente ao adicionar, atualizar ou remover uma categoria

  const getTree = (req, res) => {
    app
      .db('categories')
      .then(categories => res.json(toTree(categories))) //não precisa usar a função withPath, porque o virtualField path não será utilizado na árvore
      .catch(err => res.status(500).send(err));
  };

  return { save, remove, get, getById, getTree };
};
