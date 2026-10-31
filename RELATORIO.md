# Relatório e Documentação - Desafio Folhagem & Cia

## Documentação da API

### Visão Geral
A API da Folhagem & Cia substitui o controle manual de estoque por um sistema automatizado. O projeto foi desenvolvido com a seguinte stack: Node.js, Express, TypeScript, Prisma, PostgreSQL e Docker.

### Como Rodar
1. Clone o repositório (`git clone <link>`) e entre na pasta.
2. Copie o arquivo `.env.example` para `.env` (`cp .env.example .env`).
3. Instale as dependências com `yarn`.
4. Com o Docker Desktop aberto, suba os containers: `docker compose up -d --build`.
5. Crie as tabelas rodando `yarn migration`.
6. (Opcional - Bônus) Para popular o banco: `npx ts-node prisma/seed.ts`.

### Modelo de Dados e Enum
- **Enum Luminosidade**: `SOMBRA`, `MEIA_SOMBRA`, `SOL_PLENO`
- **Planta**:
  - `id` (Int, Autoincrement)
  - `nome` (String, popular)
  - `especie` (String, científica)
  - `preco` (Int, centavos)
  - `estoque` (Int, disponível)
  - `luminosidade` (Enum)
  - `petFriendly` (Boolean)
  - `regaACadaDias` (Int)
  - `createdAt` / `updatedAt` (DateTime)

### Rotas e Status
| Rota | Método | Descrição | Status Retornado |
|------|--------|-----------|------------------|
| `/plantas` | POST | Cria planta. Exige todos os campos no body. | 201 (Sucesso), 400 (Dados inválidos) |
| `/plantas` | GET | Lista plantas. Aceita `?luminosidade=`, `?petFriendly=`, `?nome=` e `?ordem=`. | 200 (Sucesso), 400 (Filtro inválido) |
| `/plantas/esgotadas` | GET | (Bônus) Lista plantas com estoque zero. | 200 (Sucesso) |
| `/plantas/estoque/valor-total`| GET | Soma `preco * estoque` usando `reduce`/`for` no código. | 200 (Sucesso) |
| `/plantas/:id` | GET | Busca planta específica por ID. | 200 (Sucesso), 400 (ID Inválido), 404 (Não encontrada) |
| `/plantas/:id` | PATCH | Atualiza parcialmente uma planta via body. | 200 (Sucesso), 400 (Dados inválidos), 404 (Não encontrada) |
| `/plantas/:id` | DELETE| Remove uma planta. | 204 (Sucesso), 400 (ID Inválido), 404 (Não encontrada) |
| `/plantas/:id/venda` | POST | Exige `{ "quantidade": X }`. Diminui estoque. | 200 (Sucesso), 400 (Estoque insuficiente/Dados inválidos), 404 (Não encontrada) |

---

## Relatório (Respostas)

**1. O que foi feito**
Foi implementado o CRUD obrigatório completo para `Planta`, com tipagens no Prisma, Repository e Controller. Também implementei os bônus solicitados: Busca por nome não sensível a maiúsculas (insensitve), ordenação por nome ou preço, rota de esgotadas e um script de seed básico (`prisma/seed.ts`).

**2. Como foi feito**
Segui estritamente as regras de validação apontadas no enunciado. Não utilizei `!campo` nas validações do Controller, preferindo a verificação rígida `=== undefined` para evitar barrar valores válidos como `0` ou `false`. Extraí IDs convertendo rigorosamente com `Number.isInteger()`. Para a venda, chequei o estoque primeiro e apliquei a operação atômica de `decrement` do Prisma. Tratando vendas simultâneas (concorrência): Caso duas pessoas cheguem no `decrement` e o banco barre por constraints lógicas sob forte concorrência, o try/catch protege a aplicação devolvendo erro 500 para a que falhar (evitando estoque negativo). E no `routes.ts`, as rotas fixas `/esgotadas` e `/valor-total` vieram antes do `/:id`.

**3. As principais dificuldades**
O maior desafio técnico foi o tratamento cirúrgico das queries string no Express (`req.query`), já que o Express converte tudo para string por padrão. Converter o `petFriendly` pra boolean sem estragar os filtros combinados (onde um undefined no Prisma é perfeitamente ignorado, como sugerido nas dicas) exigiu criar variáveis intermediárias.

**4. O uso de IA**
Utilizei IA para revisar os requisitos de sintaxe do `Prisma.PlantaWhereInput` visando implementar o bônus de "contains / insensitive" na busca por nome, o que facilitou muito a montagem dos filtros combinados. O restante do código base foi estruturado seguindo fielmente a organização das camadas `UserRepository` já existentes.
