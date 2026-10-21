# Base de Conhecimento API

API da minha base de conhecimento pessoal: artigos/aulas em **Markdown**, organizados por **categorias**, **tags** e **séries**, com **busca full-text** em português uma **Tabela de Estudos** (planos divididos em tópicos) e um **timer Pomodoro** com estatísticas de estudo. As aulas podem ser geradas por um workflow do **n8n** e chegam via webhook como rascunho para revisão.

Por enquanto é **monousuário**. Não há cadastro público: o único usuário é criado por um script (`npm run seed:admin`), e todas as rotas exigem login, exceto `/auth/login`, `/health` e o webhook do n8n (que usa chave de API).

## Tecnologias

- [NestJS 11](https://nestjs.com/) + TypeScript (modo `strict`)
- [TypeORM](https://typeorm.io/) + [PostgreSQL](https://www.postgresql.org/) (migrations, sem `synchronize`)
- JWT (Passport) + bcrypt
- Swagger, helmet, rate limit no login (`@nestjs/throttler`)
- Jest

## Estrutura

```
src/
  common/        # decorators (@Public, @CurrentUser), guard JWT global, filtro de erros, paginação, slugify
  config/        # validação das variáveis de ambiente
  database/      # data-source, migrations, seeds
  modules/
    auth/        # POST /auth/login
    users/       # /users/me
    articles/    # /articles
    categories/  # /categories
    tags/        # /tags
    integrations/n8n/  # POST /integrations/n8n/lessons (webhook)
    pomodoro/    # /pomodoro (configurações, sessões, estatísticas)
    study-plans/ # /study-plans (Tabela de Estudos)
    health/      # GET /health
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Retorna `access_token` (limite de 5 tentativas/min) |
| GET / PATCH | `/users/me` | Ver/editar nome e e-mail |
| PATCH | `/users/me/password` | Trocar senha (exige a atual) |
| GET | `/articles` | Lista paginada. Filtros: `search`, `categoryId`, `tag` (slug), `series`, `source` (`manual`/`n8n`), `status` (`published`/`draft`), `page`, `limit` |
| GET | `/articles/:id` · `/articles/slug/:slug` | Detalhe com categoria e tags |
| POST / PATCH / DELETE | `/articles[/:id]` | CRUD. `slug` é gerado do título se omitido; `tagIds` define as tags |
| CRUD | `/categories`, `/tags` | `slug` gerado do nome se omitido. Categoria com artigos não pode ser excluída (409) |
| POST | `/integrations/n8n/lessons` | Webhook do n8n (header `X-API-Key`). Ver abaixo |
| GET / POST | `/study-plans` | Lista os planos com progresso / cria um plano (já pode vir com `topics`) |
| GET / PATCH / DELETE | `/study-plans/:id` | Plano com progresso e tópicos na ordem / editar / excluir |
| POST | `/study-plans/:id/topics` | Adiciona tópicos ao fim (`{ "topics": [...] }`) |
| PATCH / DELETE | `/study-plans/:id/topics/:topicId` | Edita uma linha (status, prioridade, módulo, carga horária, aula vinculada) / remove |
| PUT | `/study-plans/:id/topics/order` | Reordena (`{ "topicIds": [...] }` com todos os IDs, na nova ordem) |
| GET / PATCH | `/pomodoro/settings` | Durações de foco/pausas, ciclos até a pausa longa, auto-start, fuso horário |
| POST | `/pomodoro/sessions` | Registra um bloco encerrado (`focus`, `short_break`, `long_break`), concluído ou não |
| GET / DELETE | `/pomodoro/sessions[/:id]` | Histórico paginado (`from`, `to`) / apagar registro |
| GET | `/pomodoro/stats?days=7` | Foco por dia, total do período, "hoje" e aulas mais estudadas |
| GET | `/health` | Verifica a conexão com o banco |

A busca usa `websearch_to_tsquery('portuguese', ...)`, então aceita `"frase exata"`, `-palavra` e `OR`, e os resultados vêm ordenados por relevância.

Documentação interativa: **http://localhost:3000/api**. Use o botão *Authorize* com o token do login.

## Integração com n8n

Quando o workflow termina de gerar uma aula, ele envia para a API, que salva como **rascunho**. Você revisa e publica com `PATCH /articles/:id` (`{ "isPublished": true }`).

1. Gere uma chave e coloque em `N8N_API_KEY` no `.env` (mínimo de 32 caracteres). Sem ela, o webhook responde 503.
2. No n8n, adicione um nó **HTTP Request** no fim do workflow:
   - **Method:** `POST`
   - **URL:** `https://<sua-api>/integrations/n8n/lessons`
   - **Header:** `X-API-Key: <N8N_API_KEY>` (de preferência via credencial *Header Auth*)
   - **Body (JSON):**

```json
{
  "externalId": "{{ $json.slug_do_assunto }}",
  "title": "Entendendo JOINs no SQL",
  "content": {{ JSON.stringify($json.conteudo_markdown) }},
  "category": "Banco de Dados",
  "tags": ["sql", "postgres"],
  "series": "SQL do zero",
  "seriesPosition": 3,
  "metadata": { "workflowId": "{{ $workflow.id }}", "executionId": "{{ $execution.id }}" }
}
```

> **Dica:** o Markdown tem quebras de linha e aspas, que quebram o JSON se forem interpoladas direto (`"{{ $json.x }}"`). Use `{{ JSON.stringify(...) }}` sem aspas em volta, como no `content` acima, ou monte o body com a opção *Using Fields Below* do nó.

Regras:
- `category` e `tags` vão **por nome**; as que não existirem são criadas.
- `externalId` identifica a aula. Reenviar o mesmo ID (ex.: retry do n8n) **atualiza** o rascunho em vez de duplicar. Use algo estável, como o slug do assunto. Não use o ID da execução, que muda a cada vez.
- Se a aula já foi **publicada**, a API responde `409` e não sobrescreve sua versão revisada.
- `series` e `seriesPosition` são opcionais e servem para agrupar aulas de um curso (`GET /articles?series=SQL do zero` lista em ordem).
- Respostas: `201` (criada) ou `200` (atualizada), com `{ status, id, slug, isPublished }`.

## Tabela de Estudos

Cada **plano** (ex.: "SQL do zero") tem **tópicos**, que são as linhas da tabela:

| Campo | Valores |
|---|---|
| `title` | Nome do tópico |
| `module` | Texto livre para agrupar (ex.: "Módulo 2 — Consultas") |
| `status` | `todo`, `in_progress`, `done`. Ao virar `done`, `completedAt` é preenchido |
| `priority` | `low`, `medium`, `high` |
| `estimatedMinutes` | Carga horária em **minutos**; o front converte para horas |
| `articleId` | Aula vinculada ao tópico (`null` desvincula) |
| `notes` | Anotações |

Na edição (`PATCH`), campos opcionais aceitam `null` para limpar. O plano retorna `progress` com total de tópicos, concluídos, em andamento, minutos totais e concluídos, e percentual.

## Pomodoro

O timer roda no **front**, que é quem conta o tempo. A API guarda as configurações e o histórico:

1. Ao abrir o timer, o front lê `GET /pomodoro/settings` (criado com 25/5/15 min e 4 ciclos no primeiro acesso).
2. Ao fim de cada bloco, concluído, pulado ou interrompido, o front envia `POST /pomodoro/sessions` com `startedAt`, `endedAt`, `plannedSeconds`, `completed` e, opcionalmente, o `articleId` da aula estudada.
3. "Ciclos concluídos hoje" vem de `GET /pomodoro/stats` (`today.completedSessions`). O "hoje" usa o `timezone` das configurações.

## Isolamento por usuário (IDOR)

Por enquanto só há um usuário, mas o código já está pronto para vários. Ao criar uma feature nova, siga a mesma convenção:

- Toda tabela com dono tem `userId`. Métodos de service recebem `userId` como **primeiro parâmetro**.
- O filtro de dono vai **na própria consulta** (`where: { id, userId }`), nunca como uma checagem depois de buscar. Recurso de outro usuário responde **404**, sem revelar que existe.
- IDs que chegam **dentro do corpo** (ex.: `articleId` num tópico ou numa sessão) são validados com `ArticlesService.assertOwned(userId, id)`.
- Slugs e IDs externos são únicos **por usuário**: `(userId, slug)`.
- `userId` é removido das respostas com `@Exclude()` e o `ClassSerializerInterceptor` global. Se for montar a resposta com spread de uma entidade, use `instanceToPlain()` antes.

## Rodando localmente

Pré-requisitos: Node.js 20+ e PostgreSQL. Com Docker, basta `docker compose up -d`.

```bash
npm install
cp .env.example .env          # preencha JWT_SECRET e ADMIN_*
npm run migration:run
npm run seed:admin            # cria seu usuário (rodar de novo redefine a senha)
npm run start:dev
```

### Variáveis de ambiente

Veja `.env.example`. A aplicação não sobe se faltar alguma obrigatória. Em bancos na nuvem (Neon etc.) use `DB_SSL=true`.

## Scripts

| Script | O que faz |
|---|---|
| `start:dev` | Servidor com hot reload |
| `build` / `start:prod` | Compila e roda o build |
| `test` / `test:cov` | Testes unitários |
| `lint` / `lint:check` | ESLint (com/sem `--fix`) |
| `format` | Prettier |
| `migration:generate -- src/database/migrations/<nome>` | Gera migration a partir das entidades |
| `migration:run` / `migration:revert` | Aplica / desfaz a última migration |
| `seed:admin` | Cria ou atualiza o usuário dono da base |
