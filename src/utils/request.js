import fetch from 'dva/fetch';
import { routerRedux } from 'dva/router';
import JSONbig from 'json-bigint';
import { setGlobalToast, dispatch } from './util';
import { BASE_URL } from './constant';

const codeMsg = {
  2: '登录过期，请重新登录',
  3: '无权限',
  6: '服务暂不可用',
  513: '用户名或密码错误',
  517: '验证码无效',
  524: '手机号已被注册',
  526: '无效的code',
  255: '操作失败',
  769: '设备不在线',
  771: '无效设备',
  795: '无效的价格',
  796: '设备被占用，不可支付',
  797: '设备被锁定',
  801: '设备正在租赁中',
  1026: '余额不足',
  1027: '订单已支付',
  1028: '订单已关闭',
  1029: '支付错误',
  9999: '请求失败',
};
const noNeedCheckCode = [ // 无须检查的errCode
  0,  // 请求ok
  525, // 该微信未绑定
];
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  setGlobalToast(true, codeMsg[9999]);
}
function checkCode(code) {
  if (noNeedCheckCode.includes(code)) return;

  const text = codeMsg[code] || codeMsg[9999];
  setGlobalToast(true, text);

  if (code === 2) {
    try {
      localStorage.removeItem('miwei_root_cache');
      dispatch(routerRedux.push('/login'));
    } catch(e) {
      console.log(e);
    }
  }
}


export default async function request(url, options) {
  try {
    const cache = localStorage.getItem('miwei_root_cache');
    if (cache) options.headers.Authorization = `Bearer ${JSON.parse(cache).token}`;
  } catch(e) {
    console.log(e);
  }

  const response = await fetch(BASE_URL + url, options);

  checkStatus(response);

  const text = await response.text();

  let data;
  try{
    data = JSONbig.parse(text);
  } catch(e) {
    data = {errCode: 9999, errMsg: '请求失败'};
  }

  checkCode(data.errCode);
  
  return data;
}