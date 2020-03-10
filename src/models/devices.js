import { queryDevices, getControlAuthService } from '../services/devices';

const size = 30;
export default {
  namespace: 'devices',
  state: {
    page: 1,
    hasMore: true,
    devices: [],
  },


  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const { page, deviceName } = payload;
      const params = {
        limit: size,
        offset: (page - 1) * size,
      };
      if (deviceName) params.deviceName = deviceName; //搜索时有此值

      const response = yield call(queryDevices, params);
      if (response.errCode === 0) {
        const { devices, total } = response.data;

        let newPage = page, hasMore = true;
        if (devices.length > 0) {
          newPage += 1;
        }
        if ( page * size >= total) {
          hasMore = false;
        }

        if (page === 1) { // 请求第一页数据是刷新，否则是加载下一页
          yield put({
            type: 'refreshDevices',
            payload: {
              devices,
              newPage,
              hasMore,
            },
          });
        } else {
          yield put({
            type: 'appendDevices',
            payload: {
              devices,
              newPage,
              hasMore,
            },
          });
        }
      }

      if (callback) callback(response);
    },
    *getControlAuth({ payload, callback }, { call, put }) {
      const response = yield call(getControlAuthService, payload);

      if (callback) callback(response);
    },
  },

  reducers: {
    refreshDevices(state, { payload }) {
      return {
        ...state,
        devices: payload.devices,
        page: payload.newPage,
        hasMore: payload.hasMore,
      };
    },
    appendDevices(state, { payload }) {
      return {
        ...state,
        devices: [...state.devices, ...payload.devices],
        page: payload.newPage,
        hasMore: payload.hasMore,
      };
    },
  },

};