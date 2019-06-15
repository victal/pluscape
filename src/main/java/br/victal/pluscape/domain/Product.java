package br.victal.pluscape.domain;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * A Product.
 */
@Entity
@Table(name = "product")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Product implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Column(name = "current_price", precision = 21, scale = 2, nullable = false)
    private BigDecimal currentPrice;

    @NotNull
    @Column(name = "standard_price", precision = 21, scale = 2, nullable = false)
    private BigDecimal standardPrice;

    @NotNull
    @Column(name = "link", nullable = false)
    private String link;

    
    @Lob
    @Column(name = "picture", nullable = false)
    private byte[] picture;

    @Column(name = "picture_content_type", nullable = false)
    private String pictureContentType;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "product_sizes",
               joinColumns = @JoinColumn(name = "product_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "sizes_id", referencedColumnName = "id"))
    private Set<Size> sizes = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "product_categories",
               joinColumns = @JoinColumn(name = "product_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "categories_id", referencedColumnName = "id"))
    private Set<Category> categories = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Product name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public Product description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public Product currentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
        return this;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getStandardPrice() {
        return standardPrice;
    }

    public Product standardPrice(BigDecimal standardPrice) {
        this.standardPrice = standardPrice;
        return this;
    }

    public void setStandardPrice(BigDecimal standardPrice) {
        this.standardPrice = standardPrice;
    }

    public String getLink() {
        return link;
    }

    public Product link(String link) {
        this.link = link;
        return this;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public byte[] getPicture() {
        return picture;
    }

    public Product picture(byte[] picture) {
        this.picture = picture;
        return this;
    }

    public void setPicture(byte[] picture) {
        this.picture = picture;
    }

    public String getPictureContentType() {
        return pictureContentType;
    }

    public Product pictureContentType(String pictureContentType) {
        this.pictureContentType = pictureContentType;
        return this;
    }

    public void setPictureContentType(String pictureContentType) {
        this.pictureContentType = pictureContentType;
    }

    public Set<Size> getSizes() {
        return sizes;
    }

    public Product sizes(Set<Size> sizes) {
        this.sizes = sizes;
        return this;
    }

    public Product addSize(Size size) {
        this.sizes.add(size);
        return this;
    }

    public Product removeSize(Size size) {
        this.sizes.remove(size);
        return this;
    }

    public void setSizes(Set<Size> sizes) {
        this.sizes = sizes;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public Product categories(Set<Category> categories) {
        this.categories = categories;
        return this;
    }

    public Product addCategory(Category category) {
        this.categories.add(category);
        return this;
    }

    public Product removeCategory(Category category) {
        this.categories.remove(category);
        return this;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Product)) {
            return false;
        }
        return id != null && id.equals(((Product) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Product{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", currentPrice=" + getCurrentPrice() +
            ", standardPrice=" + getStandardPrice() +
            ", link='" + getLink() + "'" +
            ", picture='" + getPicture() + "'" +
            ", pictureContentType='" + getPictureContentType() + "'" +
            "}";
    }
}
