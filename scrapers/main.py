#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os

import psycopg2
from posthaus import load_product_data as load_posthaus
from distritomoda import load_product_data as load_distritomoda
from vkmodas import load_product_data as load_vkmodas

config = {
    "DB_HOST": "localhost",
    "DB_PORT": 5432,
    "DB_NAME": "pluscape",
    "DB_USER": "pluscape",
    "DB_PASSWD": "pluscape",
    "SCRAPERS": "posthaus,distritomoda,vkmodas",
    "POSTHAUS_MAX_PAGES": None,
    "DISTRITOMODA_MAX_PAGES": None,
    "VKMODAS_MAX_PAGES": None
}


def get_current_known_data(config):
    conn = psycopg2.connect(host=config['DB_HOST'], port=config['DB_PORT'], dbname=config['DB_NAME'],
                            user=config['DB_USER'], password=config['DB_PASSWD'])
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
    return known_sizes, known_categories


def clear_current_product_data(config):
    conn = psycopg2.connect(host=config['DB_HOST'], port=config['DB_PORT'], dbname=config['DB_NAME'],
                            user=config['DB_USER'], password=config['DB_PASSWD'])
    cur = conn.cursor()
    cur.execute('truncate table product cascade')


if __name__ == '__main__':
    print("Current configuration: ")
    print("Override the following environment variables to change configs.")
    for key in config.keys():
        config[key] = os.environ.get(key, config[key])
        if config[key] is not None:
            print(key + "=" + str(config[key]))
        else:
            print(key + " not set")

    print("Getting current known sizes and categories")
    known_sizes, known_categories = get_current_known_data(config)
    print("Removing existing products")
    clear_current_product_data(config)
    if 'posthaus' in config['SCRAPERS'].split(','):
        load_posthaus(config, known_categories=known_categories, known_sizes=known_sizes,
                      max_pages=int(config['POSTHAUS_MAX_PAGES']))
    if 'distritomoda' in config['SCRAPERS'].split(','):
        load_distritomoda(config, known_categories=known_categories, known_sizes=known_sizes,
                          max_pages=int(config['DISTRITOMODA_MAX_PAGES']))
    if 'vkmodas' in config['SCRAPERS'].split(','):
        load_vkmodas(config, known_categories=known_categories, known_sizes=known_sizes,
                     max_pages=int(config['VKMODAS_MAX_PAGES']))
