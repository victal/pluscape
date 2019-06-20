import axios from 'axios';
import {
  parseHeaderForLinks,
  loadMoreDataWhenScrolled,
  ICrudGetAction,
  ICrudGetAllAction,
  ICrudPutAction,
  ICrudDeleteAction,
  ICrudSearchAction
} from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IProduct, defaultValue } from 'app/shared/model/product.model';
import { ICategory } from 'app/shared/model/category.model';

export const ACTION_TYPES = {
  FETCH_PRODUCT_LIST: 'product/FETCH_PRODUCT_LIST',
  FETCH_PRODUCT: 'product/FETCH_PRODUCT',
  CREATE_PRODUCT: 'product/CREATE_PRODUCT',
  UPDATE_PRODUCT: 'product/UPDATE_PRODUCT',
  DELETE_PRODUCT: 'product/DELETE_PRODUCT',
  SET_BLOB: 'product/SET_BLOB',
  RESET: 'product/RESET',
  FETCH_CATEGORY_LIST: 'category/FETCH_CATEGORY_LIST',
  FETCH_PRODUCT_PER_CATEGORY_LIST: 'category/FETCH_PRODUCT_PER_CATEGORY_LIST'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IProduct>,
  categories: [] as ReadonlyArray<ICategory>,
  entity: defaultValue,
  links: { next: 0 },
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ProductState = Readonly<typeof initialState>;

// Reducer

export default (state: ProductState = initialState, action): ProductState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PRODUCT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PRODUCT):
    case REQUEST(ACTION_TYPES.FETCH_CATEGORY_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PRODUCT_PER_CATEGORY_LIST):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_PRODUCT):
    case REQUEST(ACTION_TYPES.UPDATE_PRODUCT):
    case REQUEST(ACTION_TYPES.DELETE_PRODUCT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PRODUCT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CATEGORY_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PRODUCT_PER_CATEGORY_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PRODUCT):
    case FAILURE(ACTION_TYPES.CREATE_PRODUCT):
    case FAILURE(ACTION_TYPES.UPDATE_PRODUCT):
    case FAILURE(ACTION_TYPES.DELETE_PRODUCT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PRODUCT_LIST):
    case SUCCESS(ACTION_TYPES.FETCH_PRODUCT_PER_CATEGORY_LIST):
      const links = parseHeaderForLinks(action.payload.headers.link);

      return {
        ...state,
        loading: false,
        links,
        entities: loadMoreDataWhenScrolled(state.entities, action.payload.data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10)
      };
    case SUCCESS(ACTION_TYPES.FETCH_CATEGORY_LIST):
      const categoryValues = action.payload.data.map(category => ({ label: category.name, value: category.name }));
      return {
        ...state,
        loading: false,
        categories: categoryValues
      };
    case SUCCESS(ACTION_TYPES.FETCH_PRODUCT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PRODUCT):
    case SUCCESS(ACTION_TYPES.UPDATE_PRODUCT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PRODUCT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    case ACTION_TYPES.SET_BLOB:
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType
        }
      };
    case ACTION_TYPES.RESET:
      const currentCategories = state.categories;
      return {
        ...initialState,
        categories: currentCategories
      };
    default:
      return state;
  }
};

const apiUrl = 'api/products';
const categoryApiUrl = 'api/categories';
const productPerCategoryApiUrl = apiUrl + '/category';

// Actions

export const getCategories: ICrudGetAllAction<ICategory> = (page, size, sort) => {
  const requestUrl = `${categoryApiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_CATEGORY_LIST,
    payload: axios.get<ICategory>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntitiesPerCategory: ICrudSearchAction<IProduct> = (category, page, size, sort) => {
  const requestUrl = `${productPerCategoryApiUrl}?category=${category}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PRODUCT_PER_CATEGORY_LIST,
    payload: axios.get<IProduct>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntities: ICrudGetAllAction<IProduct> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PRODUCT_LIST,
    payload: axios.get<IProduct>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IProduct> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PRODUCT,
    payload: axios.get<IProduct>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IProduct> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PRODUCT,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  return result;
};

export const updateEntity: ICrudPutAction<IProduct> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PRODUCT,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IProduct> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PRODUCT,
    payload: axios.delete(requestUrl)
  });
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType
  }
});

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
