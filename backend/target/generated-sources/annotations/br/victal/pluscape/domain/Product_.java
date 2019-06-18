package br.victal.pluscape.domain;

import java.math.BigDecimal;
import javax.annotation.Generated;
import javax.persistence.metamodel.SetAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Product.class)
public abstract class Product_ {

	public static volatile SetAttribute<Product, Size> sizes;
	public static volatile SingularAttribute<Product, String> name;
	public static volatile SingularAttribute<Product, String> link;
	public static volatile SingularAttribute<Product, String> description;
	public static volatile SingularAttribute<Product, BigDecimal> currentPrice;
	public static volatile SingularAttribute<Product, BigDecimal> standardPrice;
	public static volatile SingularAttribute<Product, Long> id;
	public static volatile SetAttribute<Product, Category> categories;
	public static volatile SingularAttribute<Product, String> pictureContentType;
	public static volatile SingularAttribute<Product, byte[]> picture;

	public static final String SIZES = "sizes";
	public static final String NAME = "name";
	public static final String LINK = "link";
	public static final String DESCRIPTION = "description";
	public static final String CURRENT_PRICE = "currentPrice";
	public static final String STANDARD_PRICE = "standardPrice";
	public static final String ID = "id";
	public static final String CATEGORIES = "categories";
	public static final String PICTURE_CONTENT_TYPE = "pictureContentType";
	public static final String PICTURE = "picture";

}

