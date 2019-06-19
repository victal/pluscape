# Pluscapé

Este projeto consiste em uma API para consulta de dados de roupas plus-size vendidas nos seguintes endereços Web:

 - https://www.posthaus.com.br/plus-size-feminino
 - https://www.vkmodaplussize.com.br/plus-size-feminino/
 - https://www.distritomoda.com.br/plus-size
 
 O projeto encontra-se dividido em dois sistemas complementares ue podem ser executados independentemente:
  - backend/ : Um projeto em Java/Typescript (criado com [JHipster](https://start.jhipster.tech/)) que expõe uma API Rest 
  para consulta dos dados desejados, bem como interfaces para visualização dos dados e gerenciamento do sistema.
  - scrapers/ : Um conjunto de scripts Python responsáveis por fazer a compilação dos dados de roupas dos endereços supracitados
  e sua inserção no banco de dados utilizado pelo backend
 
O docker-compose.yml na raiz do projeto pode ser utilizado para subir a última versão disponível do projeto localmente, apontando para um banco de dados postgresql também em container local.

Mais informações para execução/build dos sistemas podem ser encontrados nos README.md nos respectivos diretórios
