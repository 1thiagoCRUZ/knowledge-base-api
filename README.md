# Base de Conhecimento API

API desenvolvida para gerenciar uma **Base de Conhecimento**, permitindo a criação e organização de artigos, categorias, tags e gerenciamento de usuários.

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

- [NestJS](https://nestjs.com/) (Framework Node.js)
- [TypeScript](https://www.typescriptlang.org/)
- [TypeORM](https://typeorm.io/) (Mapeamento Objeto-Relacional)
- [PostgreSQL](https://www.postgresql.org/) (Banco de Dados)
- [Swagger](https://swagger.io/) (Documentação da API)
- Autenticação JWT com Passport
- Bcrypt para hash de senhas

---

## 🗂️ Estrutura de Rotas (Endpoints)

A API possui os seguintes módulos e rotas principais (disponíveis via Swagger):

- **`/auth`**: Autenticação (Login) e geração de token JWT.
- **`/users`**: Gerenciamento de usuários (criação, listagem, atualização e exclusão).
- **`/articles`**: Gerenciamento de artigos da base de conhecimento.
- **`/categories`**: Gerenciamento das categorias dos artigos.
- **`/tags`**: Gerenciamento de tags para facilitar a busca de artigos.
- **`/likes`**: Sistema de "curtidas" ou avaliações de artigos.
- **`/suggestions`**: Sugestões enviadas pelos usuários sobre os artigos.
- **`/macros`**: Gerenciamento de macros/respostas rápidas.

---

## ⚙️ Pré-requisitos

Para rodar o projeto localmente, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 18+ recomendada)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- Banco de Dados PostgreSQL (Local ou em Nuvem, como o Neon.tech)

---

## 🛠️ Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto, baseando-se nas variáveis abaixo:

```env
JWT_SECRET="seu_jwt_secret_super_seguro"
DB_HOST="localhost"
DB_PORT=5432
DB_USER="seu_usuario_pg"
DB_NAME="nome_do_banco"
DB_PASSWORD="sua_senha"
PGSSLMODE="require" # Use require se for um banco em nuvem que exija SSL
```

---

## 🏃‍♂️ Como rodar o projeto

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. (Opcional) Execute as migrations para criar as tabelas no banco de dados, caso já existam migrations configuradas:
   ```bash
   npm run migration:run
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start:dev
   ```

O servidor estará rodando em `http://localhost:3000`.

---

## 📚 Documentação da API (Swagger)

A documentação interativa da API está configurada com Swagger. Com o servidor rodando, acesse no navegador:

👉 **[http://localhost:3000/api](http://localhost:3000/api)**

Lá você encontrará todos os *endpoints* detalhados, os esquemas de requisição/resposta e poderá testar as rotas diretamente pela interface.
