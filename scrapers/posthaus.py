#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import psycopg2
from bs4 import BeautifulSoup

from lib import load_produtos

BASE_URL = "https://www.posthaus.com.br/"
CDN_URL = "https://ph-cdn1.ecosweb.com.br/Web/posthaus/foto/"
API_URL = 'https://www.posthaus.com.br/plus-size-feminino?action=listar'


def get_page_product_data(page_data):
    produtos = page_data.get('listaProdutos')
    data_produtos = []
    for produto in produtos:
        data_produto = {}
        data_produto['name'] = produto.get('nome')
        data_produto['current_price'] = current_price = produto.get('preco')
        standard_price = produto.get("de")
        if standard_price == 0:
            standard_price = current_price
        data_produto['standard_price'] = standard_price
        data_produto["link"] = BASE_URL + produto.get('url')
        image_link = CDN_URL + produto.get('imagemDesktop')
        response_image = requests.get(image_link)
        data_produto["image"] = response_image.content
        data_produto["image_type"] = response_image.headers.get('Content-Type')
        detail_page = requests.get(data_produto["link"]).text
        page = BeautifulSoup(detail_page, 'html.parser')
        data_produto["tamanhos"] = set([div.text.strip() for div in page.select("#tamanhos > .combo-com-estoque")])
        data_produto['description'] = page.select_one("#tx-descricao > .descprod").text.replace("+ detalhes",
                                                                                                "").strip()
        categoria_tags = page.select(".breadcrumb-item")[1:]  # The first is just 'Plus Size Feminino'
        data_produto["categorias"] = set()
        for tag in categoria_tags:
            categoria = tag.text.strip()
            if categoria.lower().endswith('plus size'):
                categoria = categoria[0: -10]
            if not categoria.endswith('s') and len(categoria.split(' ')) == 1:
                categoria += 's'
            data_produto["categorias"].add(categoria.title())
        data_produtos.append(data_produto)

    return data_produtos


def load_product_data(db_config, known_categories, known_sizes, max_pages=None):
    print("Loading products from Posthaus")
    api_response = requests.get(API_URL)
    data = api_response.json()
    page_count = data.get('totalPaginas')
    print("%d product pages found for Posthaus" % page_count)
    pages_to_download = page_count
    if max_pages is not None:
        pages_to_download = min(page_count, max_pages)
    print("Downloading %d pages" % pages_to_download)
    connection = psycopg2.connect(host=db_config['DB_HOST'], port=db_config['DB_PORT'], dbname=db_config['DB_NAME'],
                                  user=db_config['DB_USER'], password=db_config['DB_PASSWD'])
    print("Loading page 1")
    data_produtos = get_page_product_data(data)
    load_produtos(data_produtos, connection, known_categories=known_categories, known_sizes=known_sizes)
    connection.commit()
    for page in range(2, min(pages_to_download + 1, 10)):
        print("Loading page %d" % page)
        resp = requests.get(API_URL + "&pag=%d" % page)
        data = resp.json()
        data_produtos = get_page_product_data(data)
        load_produtos(data_produtos, connection, known_categories=known_categories, known_sizes=known_sizes)
        connection.commit()

    connection.close()
