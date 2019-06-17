#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import psycopg2
from bs4 import BeautifulSoup

base_url = "https://www.vkmodaplussize.com.br/plus-size-feminino/?page=2"

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


def get_dados_produtos():
    current_page = 1
    has_results = True
    url = base_url
    data_produtos = []
    while has_results:
        print("Loading page %d" % current_page)
        if current_page > 1:
            url = url + "?page=%d" % current_page

        main_page = BeautifulSoup(requests.get(url).text, 'html.parser')
        links = main_page.select('.ProductDetails a')
        if len(links) == 0:
            return data_produtos
        for link in links:
            data_produto = {}
            link_url = link.attrs['href']
            detail_page = BeautifulSoup(requests.get(link_url).text, 'html.parser')
            main_block = detail_page.select_one(".ProductMain")
            data_produto['name'] = main_block.select_one("h1").text
            data_produto["current_price"] = main_block.select_one(".discountPrice > strong > .ValorProduto").text
            standard_price_tag = main_block.select_one(".RetailPrice .ValorProduto")
            if standard_price_tag is None:
                standard_price = data_produto['current_price']
            else:
                standard_price = standard_price_tag.text
            data_produto['standard_price'] = standard_price

            data_produto["tamanhos"] = [li.text for li in main_block.select(".DetailRow_tamanho li")]
            data_produto["link"] = link_url
            image_link = detail_page.select_one("a#zoom-area").attrs['href']
            response_image = requests.get(image_link)
            data_produto["image"] = response_image.content
            data_produto["image_type"] = response_image.headers.get('Content-Type')
            data_produto['description'] = detail_page.select_one(".ProductDescription > p").text.strip()
            categoria = data_produto['name'].lower().split(" ")[0].strip()
            data_produto['categorias'] = [categoria]
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


data_produtos = get_dados_produtos()
load_produtos(data_produtos, conn)
conn.commit()

conn.close()
