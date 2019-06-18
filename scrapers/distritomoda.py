#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import psycopg2
from bs4 import BeautifulSoup

initial_url = "https://www.distritomoda.com.br/plus-size"

conn = psycopg2.connect(host="localhost", port=5432, dbname="pluscape", user="pluscape", password="pluscape")
cur = conn.cursor()
known_sizes = {}
known_categories = {}
cur.execute("SELECT id,description FROM size")
for result in cur:
    known_sizes[result[1]] = result[0]

cur.execute("SELECT id, name FROM category")
for result in cur:
    known_categories[result[1]] = result[0]

cur.close()


def get_links_categorias():
    initial_page = BeautifulSoup(requests.get(initial_url).text, 'html.parser')
    links = initial_page.select(".menu.lateral ul.nivel-dois > li > a")
    return {link.text.strip(): link.attrs['href'] for link in links}


def get_dados_produtos(categoria, link):
    current_page = 1
    has_results = True
    url = link
    data_produtos = []
    while has_results:
        print("Loading page %d" % current_page)
        if current_page > 1:
            url = link + "?pagina=%d" % current_page
        print(url)
        main_page = BeautifulSoup(requests.get(url).text, 'html.parser')
        itens = main_page.select('#listagemProdutos .listagem-item')
        if len(itens) == 0:
            return data_produtos
        for item in itens:
            if 'indisponivel' in item.attrs['class']:
                continue  # Item indisponivel, não tem por que mostrar nem tem dados
            data_produto = {}
            link_url = item.select_one('a.produto-sobrepor').attrs['href']
            detail_page = BeautifulSoup(requests.get(link_url).text, 'html.parser')
            main_block = detail_page.select_one(".info-principal-produto").parent
            data_produto['name'] = main_block.select_one("h1.nome-produto").text
            print(data_produto['name'])
            standard_price_tag = main_block.select_one(".preco-venda")
            if standard_price_tag is not None:
                standard_price_money = standard_price_tag.text
                data_produto["standard_price"] = standard_price_money.strip().split(' ')[1].replace(',', '.')

            current_price_tag = main_block.select_one("strong.preco-promocional")
            if current_price_tag is None:
                if standard_price_tag is None:
                    continue # item sem preço
                else:
                    data_produto['current_price'] = data_produto['standard_price']
            else:
                current_price = current_price_tag.text.strip().split(' ')[1]
                data_produto['current_price'] = current_price.replace(',', '.')
                if standard_price_tag is None:
                    data_produto['standard_price'] = data_produto['current_price']

            atributos = detail_page.select(".atributo-comum")
            for atributo in atributos:
                if 'Tamanhos' in atributo.select_one('span').text:
                    data_produto["tamanhos"] = [a.text.strip() for a in atributo.select("a.atributo-item")]

            data_produto["link"] = link_url

            image_link = detail_page.select_one("img#imagemProduto").attrs['src']
            response_image = requests.get(image_link)
            data_produto["image"] = response_image.content
            data_produto["image_type"] = response_image.headers.get('Content-Type')

            data_produto['description'] = detail_page.select_one("#descricao > p").text.strip()
            data_produto['categorias'] = [categoria.lower()]
            data_produtos.append(data_produto)
        current_page += 1
    return data_produtos


def load_produtos(data_produtos, connection):
    cur = connection.cursor()
    for data_produto in data_produtos:
        q = """INSERT INTO product(id, name, description, current_price, standard_price, link, picture, picture_content_type) VALUES
        (NEXTVAL('sequence_generator'), 
         %(name)s, %(description)s, %(current_price)s, %(standard_price)s, %(link)s, %(image)s, %(image_type)s) RETURNING id"""
        cur.execute(q, data_produto)
        product_id = cur.fetchone()[0]
        for tamanho in data_produto.get('tamanhos'):
            if tamanho not in known_sizes.keys():
                cur.execute("INSERT INTO size(id, description) values(NEXTVAL('sequence_generator'), %s) returning id",
                            (tamanho,))
                id_row = cur.fetchone()
                known_sizes[tamanho] = id_row[0]
            cur.execute("""INSERT INTO product_sizes(product_id, sizes_id) VALUES (%s, %s)""",
                        (product_id, known_sizes[tamanho]))
        for categoria in data_produto.get('categorias'):  # TODO: normalize
            if categoria not in known_categories.keys():
                cur.execute("INSERT INTO category(id, name) values(NEXTVAL('sequence_generator'), %s) returning id",
                            (categoria,))
                id_row = cur.fetchone()
                known_categories[categoria] = id_row[0]
            cur.execute("""INSERT INTO product_categories(product_id, categories_id) VALUES (%s, %s)""",
                        (product_id, known_categories[categoria]))


categorias = get_links_categorias()
for categoria, link in categorias.items():
    print("Loading " + categoria)
    data_produtos = get_dados_produtos(categoria, link)
    load_produtos(data_produtos, conn)
    conn.commit()

conn.close()
