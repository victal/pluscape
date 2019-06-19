#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import psycopg2
from bs4 import BeautifulSoup

from lib import load_produtos

BASE_URL = "https://www.vkmodaplussize.com.br/plus-size-feminino/"


def get_dados_produtos(current_page=1):
    url = BASE_URL
    data_produtos = []
    print("Loading page %d" % current_page)
    if current_page > 1:
        url = BASE_URL + "?page=%d" % current_page
    print(url)
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
        if not categoria.endswith('s'):
            categoria += 's'
        data_produto['categorias'] = [categoria]
        data_produtos.append(data_produto)
    return data_produtos


def load_product_data(db_config, known_categories, known_sizes, max_pages=None):
    print("Loading products from VK Modas")
    if max_pages is not None:
        print("Loading at most %d product pages" % max_pages)
    else:
        print("Loading all products from vkmodas")

    connection = psycopg2.connect(host=db_config['DB_HOST'], port=db_config['DB_PORT'], dbname=db_config['DB_NAME'],
                                  user=db_config['DB_USER'], password=db_config['DB_PASSWD'])

    current_page = 1
    while max_pages is None or current_page <= max_pages:
        data_produtos = get_dados_produtos(current_page)
        if len(data_produtos) == 0:
            print("No more results found at page %d" % current_page)
            break
        load_produtos(data_produtos, connection, known_categories=known_categories, known_sizes=known_sizes)
        connection.commit()
        current_page += 1

    connection.close()
