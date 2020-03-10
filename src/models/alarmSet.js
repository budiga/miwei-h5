import { fetchAlarmsService, setAlarmService } from '../services/alarmSet';

export default {
  namespace: 'alarmSet',
  state: [],

  effects: {
    *fetchAlarms({ callback }, { call, put }) {
      const response = yield call(fetchAlarmsService);

      if (response.errCode === 0) {
        yield put({
          type: 'saveAlarms',
          payload: response.data,
        });
      }

      if (callback) callback(response);
    },
    *setAlarm({ callback, payload }, { call, put }) {
      const response = yield call(setAlarmService, payload);

      if (response.errCode === 0) {
        yield put({
          type: 'changeOneAlarm',
          payload: payload,
        });
      }

      if (callback) callback(response);
    },
  },

  reducers: {
    saveAlarms(state, action) {
      return action.payload;
    },
    changeOneAlarm(state, action) {
      const { deviceID, alarmEnable } = action.payload[0];
      const alarm = state.filter(item => item.deviceID === deviceID)[0];
      alarm.alarmEnable = alarmEnable;

      return [...state];
    },
  },
};