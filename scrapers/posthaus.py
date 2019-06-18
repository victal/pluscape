#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import psycopg2
from bs4 import BeautifulSoup
base_url = "https://www.posthaus.com.br/"
cdn_url = "https://ph-cdn1.ecosweb.com.br/Web/posthaus/foto/"

api_url = 'https://www.posthaus.com.br/plus-size-feminino?action=listar'
resp = requests.get(api_url)
data = resp.json()
num_paginas = data.get('totalPaginas')
print(num_paginas)

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


def get_dados_produtos(data):
    produtos = data.get('listaProdutos')
    data_produtos = []
    for produto in produtos:
        data_produto = {}
        data_produto['name'] = produto.get('nome')
        data_produto['current_price'] = current_price = produto.get('preco')
        standard_price = produto.get("de")
        if standard_price == 0:
            standard_price = current_price
        data_produto['standard_price'] = standard_price
        data_produto["link"] = base_url + produto.get('url')
        image_link = cdn_url + produto.get('imagemDesktop')
        response_image = requests.get(image_link)
        data_produto["image"] = response_image.content
        data_produto["image_type"] = response_image.headers.get('Content-Type')
        detail_page = requests.get(data_produto["link"]).text
        page = BeautifulSoup(detail_page, 'html.parser')
        data_produto["tamanhos"] = set([div.text.strip() for div in page.select("#tamanhos > .combo-com-estoque")])
        data_produto['description'] = page.select_one("#tx-descricao > .descprod").text.replace("+ detalhes", "").strip()
        categoria_tags = page.select(".breadcrumb-item")[1:]  # The first is just 'Plus Size Feminino'
        data_produto["categorias"] = set()
        for tag in categoria_tags:
            text = tag.text.strip()
            if text.lower().endswith('plus size'):
                text = text[0: -10]
            data_produto["categorias"].add(text)
        data_produtos.append(data_produto)

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


data_produtos = get_dados_produtos(data)
load_produtos(data_produtos, conn)

for page in range(2, min(num_paginas + 1,10)):
    print("Loading page %d" % page)
    resp = requests.get(api_url + "&pag=%d" %page)
    data = resp.json()
    data_produtos = get_dados_produtos(data)
    load_produtos(data_produtos, conn)
    conn.commit()

conn.close()