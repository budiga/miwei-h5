import { deviceBasicInfo, addDeviceService, requestPayService,queryRentDeviceInfoService } from '../services/snInput';

export default {
  namespace: 'snInput',
  state: {
    sn: '',
    basicInfo: null,
    rentDevInfo: null,
    priceId: 0,
  },

  effects: {
    *fetchBasicInfo({ payload, callback }, { call, put }) {
      const response = yield call(deviceBasicInfo, payload);
      if (response.errCode === 0) {
        if (response.data) {
          yield put({
            type: 'saveBasicInfo',
            payload: response.data,
          });
          yield put({
            type: 'saveSn',
            payload: response.data.deviceID,
          });
        } else {
          yield put({
            type: 'saveBasicInfo',
            payload: null,
          });
        }
      }

      if (callback) callback(response);
    },
    *addDevice ({ payload, callback },{ call, put}) {
      const response = yield call(addDeviceService, payload);
      if (response.errCode === 0 && response.data) {
        yield put({
          type: 'saveRentDevInfo',
          payload: response.data.rentDevInfo,
        });

        yield put({
          type: 'savePriceid',
          payload: response.data.rentDevInfo.rentPrices[0].id,
        });
      }

      if (callback) callback(response);
    },
    *requestPay({ payload, callback }, { call, put }) {
      const response = yield call(requestPayService, payload);

      if (callback) callback(response);
    },
    *queryRentDeviceInfo ({ payload, callback },{ call, put}) {
      const response = yield call(queryRentDeviceInfoService, payload);
      if (response.errCode === 0) {
        yield put({
          type: 'saveRentDevInfo',
          payload: response.data.rentDevInfo,
        });

        yield put({
          type: 'savePriceid',
          payload: response.data.rentDevInfo.rentPrices[0].id,
        });
      }

      if (callback) callback(response);
    },
  },

  reducers: {
    saveSn(state, action) {
      return {
        ...state,
        sn: action.payload,
      };
    },
    saveBasicInfo(state, action) {
      return {
        ...state,
        basicInfo: action.payload,
      };
    },
    saveRentDevInfo(state, action) {
      return {
        ...state,
        rentDevInfo: action.payload,
      };
    },
    savePriceid(state, action) {
      return {
        ...state,
        priceId: action.payload,
      };
    },
  },

};