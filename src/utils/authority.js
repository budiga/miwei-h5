import URI from 'urijs';
import { WECHAT_APP_ID } from './constant';

function generateGetCodeUrl(redirectURL, scope) {
  return new URI("https://open.weixin.qq.com/connect/oauth2/authorize")
    .addQuery("appid", WECHAT_APP_ID)
    .addQuery("redirect_uri", redirectURL)
    .addQuery("response_type", "code")
    .addQuery("scope", scope || "snsapi_userinfo")
    .addQuery("response_type", "code")
    .hash("wechat_redirect")
    .toString();
};

export function wechatAuth(scope) {
  const url = window.location.href || 'http://mweb.mivei.com';
  const uri = new URI(document.location.href);
  const query = uri.query(true);
  const { code } = query;
  if (!code) {
    document.location = generateGetCodeUrl(url, scope);
    // document.location.replace(generateGetCodeUrl(url, scope));
  }
};