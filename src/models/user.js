import { wechatAuth } from '../utils/authority';
import { WECHAT_APP_ID } from '../utils/constant';
import { jssdkConfigSevice } from '../services/wechat';
import {
  normalLogin,
  register_service,
  changePassword_service,
  resetPassword_service,
  logout_service,
  queryUserInfo_service,
  getVerifiedCodeService,
  editUserInfo_service,
  uploadImage_service,
  queryIssueCategory_service,
  submitIssue_service,
} from '../services/user';
const JSSDK_LIST = [
  'scanQRCode',
  'chooseWXPay',
  'getLocation',
  'configWXDeviceWiFi',
  'onMenuShareAppMessage',
  'chooseImage',
  'getLocalImgData',
];
export default {
  namespace: 'user',
  state: {
    userData: null,
    orderList: [],
    wxBindCode: '',
  },

  effects: {
    *jssdkConfig({ payload }, { call, put }) {
      const { resolve, reject, jsApiList, url } = payload;
      const response = yield call(jssdkConfigSevice, url);
      const { data } = response;
      window.wx.config({
        debug: false,
        beta: true,
        appId: WECHAT_APP_ID,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: jsApiList || JSSDK_LIST,
      });
      window.wx.ready(() => {
        resolve();
      });
      window.wx.error((err) => {
        reject(err);
      });
    },
    *login({ payload, callback}, { call, put }) {
      const response = yield call(normalLogin, payload);
      if (response.errCode === 0) {
        const cache  = {
          userID: response.data.userInfo.id,
          token: response.data.token,
        };
        localStorage.setItem('miwei_root_cache', JSON.stringify(cache));

        yield put({
          type: 'saveUserData',
          payload: response.data,
        });
      }
      
      if (callback) callback(response);
    },
    *register({ payload, callback}, { call, put }) {
      const response = yield call(register_service, payload);

      if (callback) callback(response);
    },
    *getVerifiedCode({ payload, callback }, { call, put }) {
      const response = yield call(getVerifiedCodeService, payload);

      if (callback) callback(response);
    },
    *queryUserInfo({ callback }, { call, put }) {
      const response = yield call(queryUserInfo_service);

      if (response.errCode === 0) {
        yield put({
          type: 'updateUserInfo',
          payload: response.data,
        });
      }
      if (callback) callback();
    },
    *changePassword({ payload, callback}, { call, put }) {
      const response = yield call(changePassword_service, payload);

      if (callback) callback(response);
    },
    *resetPassword({ payload, callback}, { call, put }) {
      const response = yield call(resetPassword_service, payload);

      if (callback) callback(response);
    },
    *logout({ callback }, { call, put }) {
      const response = yield call(logout_service);

      if (response.errCode === 0) {
        yield put({
          type: 'saveUserData',
          payload: null,
        });
      }
      if (callback) callback(response);
    },
    *editUserInfo({ payload, callback }, { call, put }) {
      const response = yield call(editUserInfo_service, payload);

      if (response.errCode === 0) {
        yield put({
          type: 'editUserInfoSucc',
          payload: payload,
        });
      }
      if (callback) callback(response);
    },
    *uploadImage({ payload, callback }, { call, put }) {
      const response = yield call(uploadImage_service, payload);

      if (callback) callback(response);
    },
    *queryIssueCategory({ callback }, { call, put }) {
      const response = yield call(queryIssueCategory_service);

      if (callback) callback(response);
    },
    *submitIssue({ payload, callback }, { call, put }) {
      const response = yield call(submitIssue_service, payload);

      if (callback) callback(response);
    },
  },

  reducers: {
    wechatAuthCallback(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveUserData(state, { payload }) {
      return {
        ...state,
        userData: payload,
      };
    },
    updateUserInfo(state, { payload }) {
      const userData = {
        ...state.userData,
        userInfo: payload,
      };
      return {
        ...state,
        userData,
      };
    },
    editUserInfoSucc(state, { payload }) {
      const { userInfo } = state.userData;
      if (payload.nickName) {
        userInfo.nickName = payload.nickName;
      }
      if (payload.addrCode) {
        userInfo.addrDetail = payload.addrDetail;
        userInfo.district.addrCode = payload.addrCode;
      }
      if (payload.portraitID) {
        userInfo.portraitID = payload.portraitID;
      }

      return {
        ...state
      };
    },
    setWxBindCode(state, { payload }) {
      return {
        ...state,
        wxBindCode: payload,
      };
    },
  },
};
