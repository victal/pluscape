import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
// tslint:disable-next-line:no-unused-variable
import { Translate, ICrudGetAction, openFile, byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './product.reducer';
import { IProduct } from 'app/shared/model/product.model';
// tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IProductDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export class ProductDetail extends React.Component<IProductDetailProps> {
  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  render() {
    const { productEntity } = this.props;
    return (
      <Row>
        <Col md="8">
          <h2>
            <Translate contentKey="pluscapeApp.product.detail.title">Product</Translate> [<b>{productEntity.id}</b>]
          </h2>
          <dl className="jh-entity-details">
            <dt>
              <span id="name">
                <Translate contentKey="pluscapeApp.product.name">Name</Translate>
              </span>
            </dt>
            <dd>{productEntity.name}</dd>
            <dt>
              <span id="description">
                <Translate contentKey="pluscapeApp.product.description">Description</Translate>
              </span>
            </dt>
            <dd>{productEntity.description}</dd>
            <dt>
              <span id="currentPrice">
                <Translate contentKey="pluscapeApp.product.currentPrice">Current Price</Translate>
              </span>
            </dt>
            <dd>{productEntity.currentPrice}</dd>
            <dt>
              <span id="standardPrice">
                <Translate contentKey="pluscapeApp.product.standardPrice">Standard Price</Translate>
              </span>
            </dt>
            <dd>{productEntity.standardPrice}</dd>
            <dt>
              <span id="link">
                <Translate contentKey="pluscapeApp.product.link">Link</Translate>
              </span>
            </dt>
            <dd>{productEntity.link}</dd>
            <dt>
              <span id="picture">
                <Translate contentKey="pluscapeApp.product.picture">Picture</Translate>
              </span>
            </dt>
            <dd>
              {productEntity.picture ? (
                <div>
                  <a onClick={openFile(productEntity.pictureContentType, productEntity.picture)}>
                    <img src={`data:${productEntity.pictureContentType};base64,${productEntity.picture}`} style={{ maxHeight: '30px' }} />
                  </a>
                  <span>
                    {productEntity.pictureContentType}, {byteSize(productEntity.picture)}
                  </span>
                </div>
              ) : null}
            </dd>
            <dt>
              <Translate contentKey="pluscapeApp.product.sizes">Sizes</Translate>
            </dt>
            <dd>
              {productEntity.sizes
                ? productEntity.sizes.map((val, i) => (
                    <span key={val.id}>
                      <a>{val.description}</a>
                      {i === productEntity.sizes.length - 1 ? '' : ', '}
                    </span>
                  ))
                : null}
            </dd>
            <dt>
              <Translate contentKey="pluscapeApp.product.categories">Categories</Translate>
            </dt>
            <dd>
              {productEntity.categories
                ? productEntity.categories.map((val, i) => (
                    <span key={val.id}>
                      <a>{val.name}</a>
                      {i === productEntity.categories.length - 1 ? '' : ', '}
                    </span>
                  ))
                : null}
            </dd>
          </dl>
          <Button tag={Link} to="/entity/product" replace color="info">
            <FontAwesomeIcon icon="arrow-left" />{' '}
            <span className="d-none d-md-inline">
              <Translate contentKey="entity.action.back">Back</Translate>
            </span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/entity/product/${productEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt" />{' '}
            <span className="d-none d-md-inline">
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </span>
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = ({ product }: IRootState) => ({
  productEntity: product.entity
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail);
