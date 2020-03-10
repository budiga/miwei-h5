import {
  fetchDetailService,
  setControlService,
  fetchTimersService,
  addTimerService,
  deleteTimerService,
  editTimerService,
  switchAllService,
  deleteDeviceService,
  fetchStrainersService,
  modifyDeviceService,
  fetchMatchDevicesService,
  setMatchDeviceInfoService,
  fetchLineDataService,
  fetchBarDataService,
  requestOTAService,
} from '../services/deviceDetail';

export default {
  namespace: 'deviceDetailPage',
  state: {
    deviceID: '',
    deviceDetail: null,
    strainers: [],
    pm25History:[],
    deconHistory:[],
    timersEditing: false,
    timersData: {
      enable: false,
      total: 0,
      timers: [],
    },
    editingTimer: {
      startTime: 0,
      airSpeed: 3,
      repetition: 0,
      auxiliaryHeat: false,
      ventilationMode: 0,
      powerOn: false,
      id:'',
    },
  },

  effects: {
    *fetchDetail({ payload, callback }, { call, put }) {
      const response = yield call(fetchDetailService, payload);

      if(response.errCode === 0 && !payload.reqOnlyForSet) {
        yield put({
          type: 'saveDetail',
          payload: response.data,
        });
      }

      if (callback) callback(response);
    },
    *modifyDevice({ payload, callback }, { call, put }) {
      const response = yield call(modifyDeviceService, payload);
      if(response.errCode === 0) {
        const params = {...payload};
        delete params.deviceID;

        if (params.deviceName) {
          yield put({
            type: 'saveDeviceName',
            payload: params.deviceName,
          });
        } else {
          yield put({
            type: 'saveDevicePos',
            payload: params,
          });
        }
      }

      if (callback) callback(response);
    },
    *fetchStrainers({ payload, callback }, { call, put }) {
      const response = yield call(fetchStrainersService, payload);

      if(response.errCode === 0) {
        yield put({
          type: 'saveStrainers',
          payload: response.data,
        });
      }

      if (callback) callback(response);
    },
    *resetStrainer({ payload, callback }, { call, put }) {
      const response = yield call(setControlService, payload);
      if(response.errCode === 0) {
        yield put({
          type: 'saveOneStrainer',
          payload: payload,
        });
      }

      if (callback) callback(response);
    },
    *setControl({ payload, callback }, { call, put }) {
      const response = yield call(setControlService, payload);

      if (callback) callback(response);
    },
    *deleteDevice({ payload, callback }, { call, put }) {
      const response = yield call(deleteDeviceService, payload);

      if (callback) callback(response);
    },
    *fetchTimers({ payload, callback }, { call, put }) {
      const response = yield call(fetchTimersService, payload);

      if(response.errCode === 0) {
        yield put({
          type: 'saveTimers',
          payload: response.data,
        });
      }

      if (callback) callback(response);
    },
    *addTimer({ payload, callback }, { call, put }) {
      const response = yield call(addTimerService, payload);

      if (callback) callback(response);
    },
    *deleteTimer({ payload, callback }, { call, put }) {
      const response = yield call(deleteTimerService, payload);
      if (response.errCode === 0) {
        yield put({
          type: 'saveDeleteTimer',
          payload,
        });
      }
      if (callback) callback(response);
    },
    *editTimer({ payload, callback }, { call, put }) {
      const response = yield call(editTimerService, payload);
      if(response.errCode === 0) {
        yield put({
          type: 'saveOneTimer',
          payload,
        });
      }
      if (callback) callback(response);
    },
    *switchAll({ payload, callback }, { call, put }) {
      const response = yield call(switchAllService, payload);
      if(response.errCode === 0) {
        yield put({
          type: 'saveSwitchAll',
          payload,
        });
      }

      if (callback) callback(response);
    },
    *fetchMatchDevices({ payload, callback }, { call, put }) {
      const response = yield call(fetchMatchDevicesService, payload);

      if (callback) callback(response);
    },
    *setMatchDeviceInfo({ payload, callback }, { call, put }) {
      const response = yield call(setMatchDeviceInfoService, payload);

      if (callback) callback(response);
    },
    *fetchLineData({ payload, callback }, { call, put }) {
      const response = yield call(fetchLineDataService, payload);
      if(response.errCode === 0) {
        yield put({
          type: 'saveLineData',
          payload: response.data,
        });
      }

      if (callback) callback(response);
    },
    *fetchBarData({ payload, callback }, { call, put }) {
      const response = yield call(fetchBarDataService, payload);

      if(response.errCode === 0) {
        yield put({
          type: 'saveBarData',
          payload: response.data,
        });
      }

      if (callback) callback(response);
    },
    *requestOTA({ payload, callback }, { call, put }) {
      const response = yield call(requestOTAService, payload);

      if (callback) callback(response);
    },
  },

  reducers: {
    saveDetail(state, action) {
      return {
        ...state,
        deviceDetail: action.payload,
        deviceID: action.payload.deviceID,
      };
    },
    saveDeviceName(state, action) {
      const { deviceDetail } = state;
      deviceDetail.deviceName = action.payload;

      return {
        ...state,
        deviceDetail: { ...deviceDetail },
      };
    },
    saveDevicePos(state, action) {
      const { deviceDetail } = state;
      const { devicePos } = deviceDetail;
      let newDevicePos = { ...devicePos };
      newDevicePos.addrDetail = action.payload.addrDetail;

      newDevicePos.district = {
        ...devicePos.district,
        addrCode: action.payload.addrCode,
      }

      return {
        ...state,
        deviceDetail: { ...deviceDetail, devicePos: newDevicePos},
      };
    },
    saveStrainers(state, action) {
      return {
        ...state,
        strainers: action.payload,
      };
    },
    saveOneStrainer(state, action) {
      const { strainerIndex } = action.payload;
      const index = state.strainers.findIndex(item => item.strainerIndex === strainerIndex);
      state.strainers[index].reaminingRatio = 0;
      state.strainers[index].alarm = false;
      return {
        ...state,
        strainers: [...state.strainers],
      };
    },
    saveControl(state, action) {
      const deviceStatus = {...state.deviceDetail.deviceStatus, ...action.payload};
      const deviceDetail = {...state.deviceDetail, deviceStatus};
      return {
        ...state,
        deviceDetail,
      };
    },
    saveTimers(state, action) {
      return {
        ...state,
        timersData: action.payload,
      };
    },
    saveSwitchAll(state, action) {
      const { timersData } = state;
      timersData.enable = action.payload.enable;
      return {
        ...state,
        timersData: { ...timersData },
      };
    },
    setTimersEditing(state, action) {
      return {
        ...state,
        timersEditing: action.payload,
      };
    },
    saveOneTimer(state, action){
      const { id } = action.payload;
      const { timersData } = state;
      const index = timersData.timers.findIndex(item => item.id === id);
      const newTimer = {...timersData.timers[index], ...action.payload };
      const newTimers = [ ...timersData.timers ];
      newTimers[index] = newTimer;

      return {
        ...state,
        timersData: {
          ...state.timersData,
          timers: newTimers,
        },
      };
    },
    saveDeleteTimer(state, action){
      const { id } = action.payload;
      const { timers } = state.timersData;
      const newTimers = timers.filter(item => item.id !== id);

      return {
        ...state,
        timersData: {
          ...state.timersData,
          timers: newTimers,
        },
      };
    },
    saveEditingTimer(state, action) {
      const editingTimer = {
        ...state.editingTimer,
        ...action.payload,
      }
      return {
        ...state,
        editingTimer,
      };
    },
    saveLineData(state, action) {
      return {
        ...state,
        pm25History: action.payload,
      };
    },
    saveBarData(state, action) {
      return {
        ...state,
        deconHistory: action.payload,
      };
    }
  }

};