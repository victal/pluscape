# pluscape-backend

Aplicação em Java que disponibiliza APIs REST para consultas de dados de roupas plus-size a partir dos dados dos sites "Posthaus", "Distritomoda" e "VK modas".

Apresenta tambem um front-end em react com uma tela para consulta de dados e interface de administração do sistema.

Projeto criado com [JHipster](https://start.jhipster.tech). Mais informações podem ser encontradas no arquivo [README-jhipster.md](./README-jhipster.md).

## Dependências

As seguintes dependências são necessárias para a execução do projeto a partir do código fonte:

- Node.js (na última versão LTS)

  - Java 11

  Para instalação das demais dependências necessárias basta executar:

  ```
  npm install
  ```

  neste diretório, e caso não não haja uma instalação local do [Maven](https://maven.apache.org), utilizar o wrapper `./mvnw` em seu lugar.

## Execução do projeto

Para executar a aplicação em modo de desenvolvimento (com banco de dados H2 local com dados fictícios), executar os seguintes comandos:

    ./mvnw
    npm start

## APIs

As APIs REST duisponibilizadas pelo sistema podem ser consultadas e testadas via interface administrativa no path `/admin/docs`. No modo de desenvolvimento, a interface administrativa pode ser acessada com as credenciais admin:admin

Por conveniência algumas APIs estão disponíveis para consulta sem autenticação, a saber:

- `GET /api/categories` - Lista as categorias de roupas disponíveis, com paginação opcional.
  Parâmetros:
- page: nº da página caso se deseje fazer a busca com paginação (início em 0)
- size: tamanho da página em caso de busca com paginação
- sort: string no formato `(id|name)(,asc|,desc)?`para ordenação dos resultados.

Resultado: Uma lista de itens no formato (em JSON):

```
{
  "id": [identificador único da categoria],
  "name": [descrição (também única) da categoria]
}
```

- `GET /api/products/categories` - Lista os produtos (roupas) disponíveis por categoria, ordenados por default em ordem decrescente de preço atual. Parâmetros:
- category: nome da categoria
- page: nº da página caso se deseje fazer a busca com paginação (início em 0)
- size: tamanho da página em caso de busca com paginação
- sort: string no formato `propriedade(,asc|,desc)?`para ordenação dos resultados.

Resultado: Uma lista de itens no formato (em JSON):

```
{
"categories": [lista de categorias no formato definido acima],
"currentPrice": [preço atual do produto (e.g. com desconto)],
"description": [descrição por extenso do produto],
"id": [identificador único do produto],
"link": [link para a página do produto no site original],
"name": [nome/descrição curta do produto],
"picture": [byte array referente a uma imagem do produto],
"pictureContentType": [formato da imagem como esperado em um header Content-Type, e.g. image/png],
"sizes": [ lista de tamanhos disponíveis, no formato:
{
  "description": [descrição (única) do tamanho, e.g. P, M, GG],
  "id": [ identificador único do tamanho ]
}
],
"standardPrice": [ preço normal (e.g. sem descontos) do produto ]
}
```

## Build/execução do projeto em modo de produção

Para build/execução do projeto em modo de produção basta gerar o JAR do projeto com o perfil `prod` além dos demais perfis desejados, e.g.:

```
./mvnw -Pprod,swagger clean verify
```

e executar o jar gerado com

```
java -jar target/*.jar
```

Mais informações podem ser encontradas no arquivo `README-jhipster.md`.

Para alteração de configurações da aplicação, pode-se sobrescrever as propriedades presentes no arquivo [application.yml] via variáveis de ambiente, parâmetros de linha de comando ou fornecendo um arquivo de configuração suplementar. Mais informações no próprio arquivo application.yml e/ou nos links:

- https://www.jhipster.tech/profiles/
- https://www.jhipster.tech/common-application-properties/
- http://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html
