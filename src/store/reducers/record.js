import { handleActions } from "redux-actions";
import { Success, Fail } from "utils/status";
import {
  GET_RECORDS,
  CREATE_RECORD,
  UPDATE_RECORD,
  DEL_RECORD,
  SET_PARAMS,
  EXPORT_RECORDS
} from "store/constants";

const initialState = {
  records: [],
  currentRecord: null,
  filteredResults: [],
  count: 0,
  params: {
    page: 1,
    limit: 5,
    from: null,
    to: null,
    user: []
  },
  error: ""
};

export default handleActions(
  {
    [SET_PARAMS]: (state, { payload }) => ({
      ...state,
      params: {
        ...state.params,
        ...payload
      }
    }),
    [Success(GET_RECORDS)]: (state, { payload }) => ({
      ...state,
      records: payload.records,
      count: payload.count,
      error: null
    }),
    [Fail(GET_RECORDS)]: (state, { payload }) => ({
      ...state,
      error: payload.data
    }),
    [Success(CREATE_RECORD)]: (state, { payload }) => {
      return {
        ...state,
        currentRecord: payload,
        count: state.count + 1,
        error: null
      };
    },
    [Fail(CREATE_RECORD)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data
      };
    },
    [Success(UPDATE_RECORD)]: (state, { payload }) => {
      return {
        ...state,
        currentRecord: payload,
        error: null
      };
    },
    [Fail(UPDATE_RECORD)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data
      };
    },
    [Success(DEL_RECORD)]: (state, { payload }) => {
      return {
        ...state,
        count: state.count - 1,
        error: null
      };
    },
    [Fail(DEL_RECORD)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data
      };
    },
    [Success(EXPORT_RECORDS)]: (state, { payload }) => ({
      ...state,
      filteredResults: payload.records,
      error: null
    }),
    [Fail(EXPORT_RECORDS)]: (state, { payload }) => ({
      ...state,
      error: payload.data
    })
  },
  initialState
);
