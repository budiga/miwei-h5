const WECHAT_APP_ID = 'wx2e2a1e7f76919698';

// 测试线
// const BASE_URL = 'http://60.205.205.82:9998/api/v1';
// 正式线
// const BASE_URL = 'http://47.94.227.120:9999/api/v1';
const BASE_URL = 'https://mweb.mivei.com/api/v1';

const IMG_COMMON_URL = BASE_URL + '/common/file/';

const REGEXS = {
  trim: /\s/g,
  name: /^[A-Za-z0-9_]+$/ig,
  phone: /^(13[0-9]|14[5|7]|1[5-8][0-9])\d{8}$/,
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  is_positive_int: /^\+?[1-9][0-9]*$/,
};

const DAYS = [
  { label: '每周一', key: 'bit0', value: 1},
  { label: '每周二', key: 'bit1', value: 2},
  { label: '每周三', key: 'bit2', value: 4},
  { label: '每周四', key: 'bit3', value: 8},
  { label: '每周五', key: 'bit4', value: 16},
  { label: '每周六', key: 'bit5', value: 32},
  { label: '每周日', key: 'bit6', value: 64},
];
const SPEEDS = [
  { label: '自动' },
  { label: '静音' },
  { label: '舒适' },
  { label: '标准' },
  { label: '强力' },
  { label: '飓风' },
];
const WIND_MODES = [
  { label: '低效' },
  { label: '关闭' },
  { label: '高效' },
];


export {
  BASE_URL,
  WECHAT_APP_ID,
  IMG_COMMON_URL,
  REGEXS,
  DAYS,
  SPEEDS,
  WIND_MODES
};