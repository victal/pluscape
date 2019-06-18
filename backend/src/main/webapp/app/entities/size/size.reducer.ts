import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ISize, defaultValue } from 'app/shared/model/size.model';

export const ACTION_TYPES = {
  FETCH_SIZE_LIST: 'size/FETCH_SIZE_LIST',
  FETCH_SIZE: 'size/FETCH_SIZE',
  CREATE_SIZE: 'size/CREATE_SIZE',
  UPDATE_SIZE: 'size/UPDATE_SIZE',
  DELETE_SIZE: 'size/DELETE_SIZE',
  RESET: 'size/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ISize>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false
};

export type SizeState = Readonly<typeof initialState>;

// Reducer

export default (state: SizeState = initialState, action): SizeState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_SIZE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_SIZE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_SIZE):
    case REQUEST(ACTION_TYPES.UPDATE_SIZE):
    case REQUEST(ACTION_TYPES.DELETE_SIZE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_SIZE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_SIZE):
    case FAILURE(ACTION_TYPES.CREATE_SIZE):
    case FAILURE(ACTION_TYPES.UPDATE_SIZE):
    case FAILURE(ACTION_TYPES.DELETE_SIZE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_SIZE_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_SIZE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_SIZE):
    case SUCCESS(ACTION_TYPES.UPDATE_SIZE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_SIZE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const apiUrl = 'api/sizes';

// Actions

export const getEntities: ICrudGetAllAction<ISize> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_SIZE_LIST,
  payload: axios.get<ISize>(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});

export const getEntity: ICrudGetAction<ISize> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_SIZE,
    payload: axios.get<ISize>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<ISize> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_SIZE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ISize> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_SIZE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<ISize> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_SIZE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
