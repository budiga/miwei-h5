import { fetchOrderListService } from '../services/orderList';

const size = 30;
export default {
  namespace: 'orderList',
  state: {
    page: 1,
    hasMore: false,
    orderList: [],
  },


  effects: {
    *fetchOrderList({ payload, callback }, { call, put }) {
      const { page } = payload;
      const params = {
        limit: size,
        offset: (page - 1) * size,
      };

      const response = yield call(fetchOrderListService, params);
      if (response.errCode === 0) {
        const { payments, total } = response.data;

        let newPage = page, hasMore = true;
        if (payments.length > 0) {
          newPage += 1;
        }
        if ( page * size >= total) {
          hasMore = false;
        }

        if (page === 1) {
          yield put({
            type: 'refreshOrders',
            payload: {
              orderList: payments,
              newPage,
              hasMore,
            },
          });
        } else {
          yield put({
            type: 'appendOrders',
            payload: {
              orderList: payments,
              newPage,
              hasMore,
            },
          });
        }
      }

      if (callback) callback(response);
    },
  },

  reducers: {
    refreshOrders(state, { payload }) {
      return {
        ...state,
        orderList: payload.orderList,
        page: payload.newPage,
        hasMore: payload.hasMore,
      };
    },
    appendOrders(state, { payload }) {
      return {
        ...state,
        orderList: [...state.orderList, ...payload.orderList],
        page: payload.newPage,
        hasMore: payload.hasMore,
      };
    },
  },

};