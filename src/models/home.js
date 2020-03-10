import { routerRedux } from 'dva/router';

export default {
  namespace: 'home',
  state: {
    tabIndex: 0,
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
    *toScan({ payload }, { call, put }){
      yield put(routerRedux.push('/scan'));
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    setTabIndex(state, action) {
      return {
        ...state,
        tabIndex: action.payload,
      };
    },
  },

};