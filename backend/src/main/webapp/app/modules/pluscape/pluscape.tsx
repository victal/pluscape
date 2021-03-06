import './pluscape.scss';

import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Container, Col, Row, Table } from 'reactstrap';
import Select from 'react-select';
// tslint:disable-next-line:no-unused-variable
import { openFile, byteSize, Translate, ICrudGetAllAction, getSortState, IPaginationBaseState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntitiesPerCategory as getProducts, getCategories, reset } from 'app/entities/product/product.reducer';
import { IProduct } from 'app/shared/model/product.model';
// tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';

export interface IProductProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export interface IPluscapeState extends IPaginationBaseState {
  category: string;
}

export class Pluscape extends React.Component<IProductProps, IPluscapeState> {
  state: IPluscapeState = {
    ...getSortState(this.props.location, 3),
    category: null,
    sort: 'currentPrice',
    order: 'desc'
  };

  componentDidMount() {
    this.reset();
  }

  componentDidUpdate() {
    if (this.props.updateSuccess) {
      this.reset();
    }
  }

  reset = () => {
    this.props.reset();
    this.setState({ activePage: 1 }, () => {
      this.getCategories();
    });
  };

  handleCategorySelection = selectedCategory => {
    this.props.reset();
    this.setState({ activePage: 1, category: selectedCategory.value }, () => {
      this.getProducts();
    });
  };

  handleLoadMore = () => {
    if (window.pageYOffset > 0) {
      this.setState({ activePage: this.state.activePage + 1 }, () => this.getProducts());
    }
  };

  loadMore = () => {
    this.setState({ activePage: this.state.activePage + 1 }, () => this.getProducts());
  };

  sort = prop => () => {
    this.setState(
      {
        order: this.state.order === 'asc' ? 'desc' : 'asc',
        sort: prop
      },
      () => {
        this.reset();
      }
    );
  };

  hasMore = () => this.state.activePage - 1 < this.props.links.next;

  getProducts = () => {
    const { activePage, itemsPerPage, sort, order, category } = this.state;
    this.props.getProducts(category, activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  getCategories = () => {
    this.props.getCategories();
  };

  render() {
    const { productList, categoryList, totalItems } = this.props;
    return (
      <div>
        <Row>
          <Col xs="12" sm="12" md={{ size: 4, offset: 4 }} style={{ marginBottom: '1em' }}>
            <Select options={categoryList} onChange={this.handleCategorySelection} placeholder="Escolha uma Categoria..." />
          </Col>
        </Row>
        {totalItems && totalItems > 0 ? (
          <Row>
            <Col xs="12" sm="12" md={{ size: 4, offset: 4 }} style={{ marginBottom: '1em' }}>
              <Translate contentKey="pluscapeApp.product.home.found" interpolate={{ param: totalItems }}>
                Products found
              </Translate>
            </Col>
          </Row>
        ) : (
          <div className="alert alert-warning">
            <Translate contentKey="pluscapeApp.product.home.notFound">No Products found</Translate>
          </div>
        )}
        <div className="table-responsive">
          <InfiniteScroll
            pageStart={this.state.activePage}
            loadMore={this.handleLoadMore}
            hasMore={this.hasMore}
            loader={<div className="loader" />}
            threshold={10}
            initialLoad={false}
          >
            {productList && productList.length > 0 ? (
              <Container>
                <Row>
                  {productList.map((product, i) => (
                    <Col xs="12" sm="12" md="4" key={`entity-${i}`} style={{ border: '1px solid grey', marginBottom: '1em' }}>
                      <a href={product.link} target="_blank" className="no-decoration">
                        {product.picture ? (
                          <div>
                            <div>
                              <Row>
                                <span style={{ fontSize: '140%', textAlign: 'center' }}>{product.name}</span>
                              </Row>
                              <Row>
                                <Col xs="12" sm="12" md="6" style={{ padding: '0' }}>
                                  <img src={`data:${product.pictureContentType};base64,${product.picture}`} style={{ maxWidth: '100%' }} />
                                </Col>
                                <Col xs="12" sm="12" md="5" style={{ textAlign: 'justify' }}>
                                  <p>{product.description}</p>
                                </Col>
                              </Row>
                              <Row>
                                <p hidden={product.standardPrice === product.currentPrice}>
                                  De: R${product.standardPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}&nbsp;
                                </p>
                                <p>
                                  <span hidden={product.standardPrice === product.currentPrice}>Por: </span>
                                  <span hidden={product.standardPrice !== product.currentPrice}>Preço: </span>
                                  R$ {product.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                              </Row>
                              <Row>
                                <strong>Tamanhos: </strong>
                                {product.sizes
                                  .sort((s1, s2) => {
                                    if (s1.description.length !== s2.description.length) {
                                      return s1.description.length < s2.description.length ? -1 : 1;
                                    } else {
                                      if (s1.description.length > 1) {
                                        return s1.description < s2.description ? -1 : 1;
                                      } else {
                                        return s2.description < s1.description ? -1 : 1;
                                      }
                                    }
                                  })
                                  .map((size, j) => (
                                    <p>{size.description}&nbsp;</p>
                                  ))}
                              </Row>
                            </div>
                          </div>
                        ) : null}
                      </a>
                    </Col>
                  ))}
                </Row>
              </Container>
            ) : (
              <Container />
            )}
          </InfiniteScroll>
          <a hidden={!this.hasMore()} onClick={this.loadMore}>
            Carregar mais produtos...
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ product }: IRootState) => ({
  productList: product.entities,
  categoryList: product.categories,
  totalItems: product.totalItems,
  links: product.links,
  entity: product.entity,
  updateSuccess: product.updateSuccess
});

const mapDispatchToProps = {
  getProducts,
  getCategories,
  reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pluscape);
