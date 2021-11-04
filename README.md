# Projeto Base de Conhecimento - Backend

REST API desenvolvida com base no projeto final do curso **Web Moderno com JavaScript** da Cod3r (https://www.cod3r.com.br/courses/web-moderno)

- Frontend: https://github.com/henriquedornel/knowledge-frontend

- Live demo: https://knowledge.henriquedornel.com

## Linguagens e tecnologias utilizadas

- [JavaScript](https://www.javascript.com/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Knex.js](https://knexjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [MongoDB](https://www.mongodb.com/)

## Instalação e execução

#### 1. Clonar o repositório

#### 2. Instalar dependências:

```
    yarn
```

#### 3. Banco de dados:

- Instalar o PostgreSQL (https://postgresql.org/download/)
- Criar a base de dados da aplicação:

```
    psql -U postgres
    CREATE DATABASE knowledge;
    \q
```

- Instalar o Knex globalmente:

```
    npm i -g knex
```

- Migrações:

```
    yarn migrate
```

- Instalar o MongoDB Compass (https://www.mongodb.com/pt-br/products/compass)
- Inicializar o MongoDB:

```
    mongod
```

#### 4. Variáveis de ambiente:

- Copiar o arquivo `.env.example` para `.env` e editar o seu conteúdo, de acordo com o seu ambiente local

#### 5. Executar servidor local de desenvolvimento:

```
    yarn dev
```
