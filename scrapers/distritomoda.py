#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import psycopg2
from bs4 import BeautifulSoup

from lib import load_produtos

INITIAL_URL = "https://www.distritomoda.com.br/plus-size"


def get_links_categorias():
    initial_page = BeautifulSoup(requests.get(INITIAL_URL).text, 'html.parser')
    links = initial_page.select(".menu.lateral ul.nivel-dois > li > a")
    return {link.text.strip(): link.attrs['href'] for link in links}


def get_dados_produtos(categoria, link, current_page):
    url = link
    data_produtos = []
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
        standard_price_tag = main_block.select_one(".preco-venda")
        if standard_price_tag is not None:
            standard_price_money = standard_price_tag.text
            data_produto["standard_price"] = standard_price_money.strip().split(' ')[1].replace(',', '.')

        current_price_tag = main_block.select_one("strong.preco-promocional")
        if current_price_tag is None:
            if standard_price_tag is None:
                continue  # item sem preço, vamos ignorar
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

        categoria = categoria.lower()
        if categoria.endswith('s') and len(categoria.split(' ')) == 1 and categoria != 'jeans':
            categoria = categoria[0:-1]
        data_produto['categorias'] = [categoria.title()]

        data_produtos.append(data_produto)
    return data_produtos


def load_product_data(db_config, known_categories, known_sizes, max_pages=None):
    print("Loading products from Distritomoda")
    if max_pages is not None:
        print("Loading at most %d product pages per category" % max_pages)
    else:
        print("Loading all products from each category")

    categorias = get_links_categorias()
    connection = psycopg2.connect(host=db_config['DB_HOST'], port=db_config['DB_PORT'], dbname=db_config['DB_NAME'],
                                  user=db_config['DB_USER'], password=db_config['DB_PASSWD'])
    for category, link in categorias.items():
        print("Loading products for category: " + category)
        current_page = 1
        while max_pages is None or current_page <= max_pages:
            data_produtos = get_dados_produtos(category, link, current_page)
            if len(data_produtos) == 0:
                print("No more results found at page %d for category %s" % (current_page, category))
                break
            load_produtos(data_produtos, connection, known_categories=known_categories, known_sizes=known_sizes)
            connection.commit()
            current_page += 1

    connection.close()
