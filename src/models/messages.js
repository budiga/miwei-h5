import { queryMessages, setPermissionService } from '../services/messages';

const size = -20;
let reqTime = 0;
export default {
  namespace: 'messages',
  state: {
    page: 1,
    hasMore: true,
    msgList: [],
  },


  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const { loadMore } = payload;
      let params;
      if (loadMore) {
        params = {
          limit: size,
          time: reqTime,
        };
      } else {
        params = {
          limit: size,
        };
      }
      const response = yield call(queryMessages, params);
      if (response.errCode === 0) {
        const { messages } = response.data;

        let hasMore = true;
        const len = messages.length;
        if (len > 0) {
          reqTime = messages[len - 1].time;
        }
        if ( len < Math.abs(size)) {
          hasMore = false;
        }

        if (!loadMore) {
          yield put({
            type: 'refreshMessages',
            payload: {
              msgList: messages,
              hasMore,
            },
          });
        } else {
          yield put({
            type: 'appendMessages',
            payload: {
              msgList: messages,
              hasMore,
            },
          });
        }
      }

      if (callback) callback(response);
    },
    *setPermission({ payload, callback }, { call, put }) {
      const response = yield call(setPermissionService, payload);

      if (callback) callback(response);
    },
  },

  reducers: {
    refreshMessages(state, { payload }) {
      return {
        ...state,
        msgList: payload.msgList,
        hasMore: payload.hasMore,
      };
    },
    appendMessages(state, { payload }) {
      return {
        ...state,
        msgList: [...state.msgList, ...payload.msgList],
        hasMore: payload.hasMore,
      };
    },
  },

};