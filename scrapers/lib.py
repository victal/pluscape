def load_produtos(page_products, connection, known_categories, known_sizes):
    cursor = connection.cursor()
    for data_produto in page_products:
        product_insert = """INSERT INTO product(id, name, description, current_price, standard_price, link, picture, picture_content_type) VALUES
        (NEXTVAL('SEQ_PRODUCT'), 
         %(name)s, %(description)s, %(current_price)s, %(standard_price)s, %(link)s, %(image)s, %(image_type)s) RETURNING id"""
        cursor.execute(product_insert, data_produto)
        product_id = cursor.fetchone()[0]
        for tamanho in data_produto.get('tamanhos'):
            if tamanho not in known_sizes.keys():
                cursor.execute("INSERT INTO size(id, description) values(NEXTVAL('SEQ_SIZE'), %s) returning id",
                               (tamanho,))
                id_row = cursor.fetchone()
                known_sizes[tamanho] = id_row[0]
            cursor.execute("""INSERT INTO product_sizes(product_id, sizes_id) VALUES (%s, %s)""",
                           (product_id, known_sizes[tamanho]))
        for categoria in data_produto.get('categorias'):  # TODO: normalize
            if categoria not in known_categories.keys():
                cursor.execute("INSERT INTO category(id, name) values(NEXTVAL('SEQ_CATEGORY'), %s) returning id",
                               (categoria,))
                id_row = cursor.fetchone()
                known_categories[categoria] = id_row[0]
            cursor.execute("""INSERT INTO product_categories(product_id, categories_id) VALUES (%s, %s)""",
                           (product_id, known_categories[categoria]))