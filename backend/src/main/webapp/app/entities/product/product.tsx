import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
// tslint:disable-next-line:no-unused-variable
import { openFile, byteSize, Translate, ICrudGetAllAction, getSortState, IPaginationBaseState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities, reset } from './product.reducer';
import { IProduct } from 'app/shared/model/product.model';
// tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';

export interface IProductProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export type IProductState = IPaginationBaseState;

export class Product extends React.Component<IProductProps, IProductState> {
  state: IProductState = {
    ...getSortState(this.props.location, ITEMS_PER_PAGE)
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
      this.getEntities();
    });
  };

  handleLoadMore = () => {
    if (window.pageYOffset > 0) {
      this.setState({ activePage: this.state.activePage + 1 }, () => this.getEntities());
    }
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

  getEntities = () => {
    const { activePage, itemsPerPage, sort, order } = this.state;
    this.props.getEntities(activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  render() {
    const { productList, match } = this.props;
    return (
      <div>
        <h2 id="product-heading">
          <Translate contentKey="pluscapeApp.product.home.title">Products</Translate>
          <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity" id="jh-create-entity">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="pluscapeApp.product.home.createLabel">Create new Product</Translate>
          </Link>
        </h2>
        <div className="table-responsive">
          <InfiniteScroll
            pageStart={this.state.activePage}
            loadMore={this.handleLoadMore}
            hasMore={this.state.activePage - 1 < this.props.links.next}
            loader={<div className="loader">Loading ...</div>}
            threshold={0}
            initialLoad={false}
          >
            {productList && productList.length > 0 ? (
              <Table responsive>
                <thead>
                  <tr>
                    <th className="hand" onClick={this.sort('id')}>
                      <Translate contentKey="global.field.id">ID</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={this.sort('name')}>
                      <Translate contentKey="pluscapeApp.product.name">Name</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={this.sort('description')}>
                      <Translate contentKey="pluscapeApp.product.description">Description</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={this.sort('currentPrice')}>
                      <Translate contentKey="pluscapeApp.product.currentPrice">Current Price</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={this.sort('standardPrice')}>
                      <Translate contentKey="pluscapeApp.product.standardPrice">Standard Price</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={this.sort('link')}>
                      <Translate contentKey="pluscapeApp.product.link">Link</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={this.sort('picture')}>
                      <Translate contentKey="pluscapeApp.product.picture">Picture</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {productList.map((product, i) => (
                    <tr key={`entity-${i}`}>
                      <td>
                        <Button tag={Link} to={`${match.url}/${product.id}`} color="link" size="sm">
                          {product.id}
                        </Button>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.description}</td>
                      <td>{product.currentPrice}</td>
                      <td>{product.standardPrice}</td>
                      <td>{product.link}</td>
                      <td>
                        {product.picture ? (
                          <div>
                            <a onClick={openFile(product.pictureContentType, product.picture)}>
                              <img src={`data:${product.pictureContentType};base64,${product.picture}`} style={{ maxHeight: '30px' }} />
                              &nbsp;
                            </a>
                            <span>
                              {product.pictureContentType}, {byteSize(product.picture)}
                            </span>
                          </div>
                        ) : null}
                      </td>
                      <td className="text-right">
                        <div className="btn-group flex-btn-group-container">
                          <Button tag={Link} to={`${match.url}/${product.id}`} color="info" size="sm">
                            <FontAwesomeIcon icon="eye" />{' '}
                            <span className="d-none d-md-inline">
                              <Translate contentKey="entity.action.view">View</Translate>
                            </span>
                          </Button>
                          <Button tag={Link} to={`${match.url}/${product.id}/edit`} color="primary" size="sm">
                            <FontAwesomeIcon icon="pencil-alt" />{' '}
                            <span className="d-none d-md-inline">
                              <Translate contentKey="entity.action.edit">Edit</Translate>
                            </span>
                          </Button>
                          <Button tag={Link} to={`${match.url}/${product.id}/delete`} color="danger" size="sm">
                            <FontAwesomeIcon icon="trash" />{' '}
                            <span className="d-none d-md-inline">
                              <Translate contentKey="entity.action.delete">Delete</Translate>
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="alert alert-warning">
                <Translate contentKey="pluscapeApp.product.home.notFound">No Products found</Translate>
              </div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ product }: IRootState) => ({
  productList: product.entities,
  totalItems: product.totalItems,
  links: product.links,
  entity: product.entity,
  updateSuccess: product.updateSuccess
});

const mapDispatchToProps = {
  getEntities,
  reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Product);
