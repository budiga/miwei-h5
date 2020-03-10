import { stringify } from '../utils/util';
import request from '../utils/request';

export async function fetchOrderListService(params) {
  return request(`/mobile/user/queryPaymentHistory?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}