import "@babel/polyfill";
import dva from 'dva';
import createHistory from 'history/createBrowserHistory';
// import createLoading from 'dva-loading';
import 'weui';
import './utils/base.less';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { BASE_URL, WECHAT_APP_ID } from './utils/constant';

const persistConfig = {
  key: 'miweih5_root',
  storage: storage,
}
let $persistor;
export function createPersistorIfNecessary(store) {
  if (!$persistor && store) {
    $persistor = persistStore(store);
    const rootReducer = persistReducer(persistConfig, state => state);
    store.replaceReducer(rootReducer);
    $persistor.persist();
  }
  return $persistor;
}


// --判断时android还是ios--
function isAndroid(){
  const userAgent = navigator.userAgent;
  const isAndr = userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1;
  return isAndr;
}
// ios：只需要首次进入webapp时config一下；android：需要在每个调用微信api的页面config一下
if (!isAndroid()) {
  const JSSDK_LIST = [
    'scanQRCode',
    'chooseWXPay',
    'getLocation',
    'configWXDeviceWiFi',
    'onMenuShareAppMessage',
    'chooseImage',
    'getLocalImgData',
    'onMenuShareTimeline',
  ];
  fetch(BASE_URL+'/mobile/wetchat/requestJssdkConfig',{
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(window.location.href)}`,
  }).then(res => {
    return res.json();
  }).then(res => {
    const data = res.data;
    window.wx.config({
      debug: false,
      beta: true,
      appId: WECHAT_APP_ID,
      timestamp: data.timestamp,
      nonceStr: data.nonceStr,
      signature: data.signature,
      jsApiList: JSSDK_LIST,
    })
    window.wx.ready(() => {
      console.log('ios config success in index.js!');
    })
    window.wx.error((err) => {
      // alert(JSON.stringify(err));
      console.log(JSON.stringify(err));
    })
  }).catch(res => {
    console.log('ios config failed');
  });
}


// 1. Initialize
const app = dva({
  onReducer: (reducer) => {
    if (createPersistorIfNecessary(app._store)) {
      const newReducer = persistReducer(persistConfig, reducer)
      setTimeout(() => $persistor && $persistor.persist(), 0)
      return newReducer
    } else {
      return reducer
    }
  },
  history: createHistory(),
});

// 2. Plugins
// app.use(createLoading());

// 3. Model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

export default app._store;
