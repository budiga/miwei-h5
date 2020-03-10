import store from '../index';
import cnData from './city';

const { dispatch } = store;

function requestJssdkConfig(jsApiList, url) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: 'user/jssdkConfig',
      payload: {
        resolve: resolve,
        reject: reject,
        jsApiList,
        url,
      }
    });
  });
}

function setGlobalToast(show, text) {
  dispatch({
    type: 'global/setToast',
    payload: {
      show,
      text,
    },
  });

  window.globalToastTimer = setTimeout(() => {
    dispatch({
      type: 'global/setToast',
      payload: {
        show: false,
        text: '',
      },
    });
    clearTimeout(window.globalToastTimer);
  },1500);
}

function setGlobalLoading(flag) {
  dispatch({
    type: 'global/setGlobalLoading',
    payload: flag,
  });
}

function setGlobalDialog(show, text) {
  dispatch({
    type: 'global/setGlobalDialog',
    payload: {
      show,
      text,
    },
  });
}

function secToHour(sec) {
  if (!sec) return '00:00:00';
  
  let second = sec;
  let h=0,m=0;
  if(second>3600){
    h=Math.floor(second/3600);
    second=second%3600;
  }
  if(second>60){
    m=Math.floor(second/60);
    second=second%60;
  }

  let result = '';
  if (h > 0) {
    result += (h < 10 ? `0${h}` : h) + ':';
  }else {
    result += '00:';
  }

  if (m > 0) {
    result += (m < 10 ? `0${m}` : m) + ':';
  } else {
    result += '00:';
  }

  if (second > 0) {
    result += (second < 10 ? `0${second}` : second);
  } else {
    result += '00';
  }

  return result;
}

function stringify (obj, prefix) {
  var pairs = []
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue
    }

    var value = obj[key]
    var enkey = encodeURIComponent(key)
    var pair
    // if (typeof value === 'object') {
    //   pair = queryStringify(value, prefix ? prefix + '[' + enkey + ']' : enkey)
    // } else {
      pair = (prefix ? prefix + '[' + enkey + ']' : enkey) + '=' + encodeURIComponent(value)
    // }
    pairs.push(pair)
  }
  return pairs.join('&')
}


let last;
function canPass(param) {
  let range = param || 67;
  if (!last) {
    last = (new Date()).getTime();
    return true;
  } else {
    let cur = (new Date()).getTime();
    if (cur - last < range) return false;
    last = cur;
    return true;
  }
}

function genRepeText( repetition ) {
  let flag0, flag1, flag2, flag3, flag4, flag5, flag6;
  flag0 = flag1 = flag2 = flag3 = flag4 = flag5 = flag6 = false;
  let text = '';

  if ((repetition&1) === 1) flag0 = true;
  if ((repetition&2) === 2) flag1 = true;
  if ((repetition&4) === 4) flag2 = true;
  if ((repetition&8) === 8) flag3 = true;
  if ((repetition&16) === 16) flag4 = true;
  if ((repetition&32) === 32) flag5 = true;
  if ((repetition&64) === 64) flag6 = true;

  if (flag0 && flag1 && flag2 && flag3 && flag4 && flag5 && flag6) {
    text = '全部';
  } else if (flag0 && flag1 && flag2 && flag3 && flag4) {
    text = '工作日';
  } else if (!flag0 && !flag1 && !flag2 && !flag3 && !flag4 && !flag5 && !flag6) {
    text = '永不';
  } else {
    if (flag0) text += '周一';
    if (flag1) text += ' 周二';
    if (flag2) text += ' 周三';
    if (flag3) text += ' 周四';
    if (flag4) text += ' 周五';
    if (flag5) text += ' 周六';
    if (flag6) text += ' 周日';
  }

  return text;
}

function getAddrCode(text) {
  const addrs = text.split(' ');
  addrs.pop();

  const provinceIndex = cnData.findIndex(item => item.name === addrs[0]);
  const province = cnData[provinceIndex];

  const cityIndex = province.sub.findIndex(item => item.name === addrs[1]);
  const city = province.sub[cityIndex];

  const districtIndex = city.sub && city.sub.length > 0 && city.sub.findIndex(item => item.name === addrs[2]);
  const district = city.sub[districtIndex];

  return {
    code: district.code,
    selected: [provinceIndex, cityIndex, districtIndex],
  };
}

function getAddrText(addrCode) {
  let text_16 = addrCode.toString(16);
  const code = text_16.slice(3);

  let proText, cityText, disText;

  let len = cnData.length;
  outer:
  for(let i = 0; i < len; i++){
    let pro = cnData[i];
    proText = pro.name;
    if (pro.code === code){
      break outer;
    } else {
      if (pro.sub && pro.sub.length > 0) {
        let len2 = pro.sub.length;
        middle:
        for (let j = 0; j < len2; j++) {
          let city = pro.sub[j];
          cityText = city.name;
          if (city.code === code) {
            break outer;
          } else {
            if (city.sub && city.sub.length > 0) {
              let len3 = city.sub.length;
              inner:
              for (let k = 0; k < len3; k++){
                let dis = city.sub[k];
                disText = dis.name;
                if (dis.code === code){
                  break outer;
                }
              }
            }
          }
        }
      }
    }
  }

  return [proText, cityText, disText];
}

function toDataUrl(param){
  let dataurl = '';
  if(param.indexOf('data:image') == 0){ // ios
    dataurl = param;
  } else { //android
    dataurl = 'data:image/jpeg;base64,'+param.replace(/\n/g,''); 
  }

  return dataurl;
}

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','),
  mime = arr[0].match(/:(.*?);/)[1],
  bstr = atob(arr[1]),
  n = bstr.length,
  u8arr = new Uint8Array(n);
  // alert(mime);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}

function isAndroid(){
  const userAgent = navigator.userAgent;
  const isAndr = userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1;
  return isAndr;
}

export {
  dispatch,
  requestJssdkConfig,
  setGlobalToast,
  setGlobalLoading,
  setGlobalDialog,
  secToHour,
  stringify,
  canPass,
  genRepeText,
  getAddrCode,
  getAddrText,
  toDataUrl,
  dataURLtoBlob,
  isAndroid,
};