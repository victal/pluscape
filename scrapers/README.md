# pluscape-scrapers

Scripts em python 3 para carregamento de dados no backend do Pluscapé a partir dos sites "Posthaus", "Distritomoda" e "VK modas".

## Instalação/dependências

As seguintes dependências são necessárias para execução dos scripts:
 - [beautifulsoup4](https://pypi.org/project/beautifulsoup4/)
 - [requests](https://pypi.org/project/requests/)
 - [psycopg2-binary](https://pypi.org/project/psycopg2-binary/) ou psycopg2
 
 podendo ser instaladas a partir do arquivo `requirements.txt` ou do `Pipfile` fornecidos.
 
 Além disso, a execução dos scripts pressupõe a existência de um banco de dados PostgreSQL já com a estrutura definida 
 pelo sistema de backend.
 
 ## Execução
 
 Com as dependências instaladas, para executar os scripts de carregamento bastaria executar

```
python main.py
```

**porém** para configurar o banco onde as informações serão carregadas, bem como configurações de cada script de carregamento, 
pode-se definir as seguintes variáveis de ambiente:


| Variável | Descrição             | Valor Default |
| ---------|:---------------------:| -------------:|
|DB_HOST   |Host do banco de dados | localhost     |
|DB_PORT   |Porta de conexão ao BD | 5432          |
|DB_NAME   |Nome do database       | pluscape      |
|DB_USER   |Usuário de acesso ao BD| pluscape      |
|DB_PASSWD |Senha de acesso ao BD  | pluscape      |
|SCRAPERS  |Lista separada por vírgula dos scripts de carregamento a executar|posthaus,distritomoda,vkmodas|
|POSTHAUS_MAX_PAGES| Nº de páginas de dados a carregar do site Posthaus | - (carrega quantas houver)|
|DISTRITOMODA_MAX_PAGES| Nº de páginas de dados a carregar do site Distrito Moda (*por categoria*)| - (carrega quantas houver)|
|VKMODAS_MAX_PAGES| Nº de páginas de dados a carregar do site VK Modas| - (carrega quantas houver)|

Assim uma execução mais típica do script de carregamento pode ser:
```
DB_USER=user DBPASSWD=senha python main.py
```
Ou, para um teste com apenas uma amostra dos dados (cada site tinha ~100 páginas de produtos quando da escrita deste readme):
```
POSTHAUS_MAX_PAGES=10 DISTRITOMODA_MAX_PAGES=5 VKMODAS_MAX_PAGES=10 python main.py
```

## Docker
Para evitar a instalação local de dependências pode ser gerado um container docker para execução dos scripts a partir do 
Dockerfile disponibilizado

```
docker build -t pluscape-scrapers:latest .
```

Bem como a última versão dos scripts encontra-se usualmente disponibilizada no [Docker Hub](https://cloud.docker.com/u/victal/repository/docker/victal/pluscape-scrapers) podendo ser executada como

```
docker run -it --rm -e <variáveis de ambiente definidas acima> --net=host victal/pluscape-scrapers
```
