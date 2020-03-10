export default {
  namespace: 'global',
  state: {
    toast: {
      show: false,
      text: '',
    },
    loading: false,
    dialog: {
      show: false,
      text: '',
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      yield put({ type: 'save' });
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    setToast(state, action) {
      return {
        ...state,
        toast: action.payload,
      };
    },
    setGlobalLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    setGlobalDialog(state, action) {
      return {
        ...state,
        dialog: action.payload,
      };
    },
  },

};