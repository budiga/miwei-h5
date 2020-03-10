import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Popup } from 'react-weui';
import URI from 'urijs';
import moment from 'moment';

import { setGlobalToast, requestJssdkConfig, isAndroid } from '../../utils/util';
import { wechatAuth } from '../../utils/authority';
import styles from './index.less';
import danxuan_normal from '../../assets/pay/danxuan_normal.png';
import danxuan_select from '../../assets/pay/danxuan_select.png';
import dev_pic from '../../assets/pay/dev_pic.png';
import PmIndicator from '../../components/pmIndicator';

class Pay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      popupShow: true,
    };
  }

  componentWillMount() {
   if(isAndroid()) this.jssdkPre();
  }
  componentDidMount() {
    document.title = '支付';

    const { history, dispatch } = this.props;
    console.log('pay page--------------:', history);
    const uri = new URI(document.location.href);
    const query = uri.query(true);
    const { code } = query;
    if (!code) {
      if (history.action === 'PUSH'){
        wechatAuth('snsapi_base');
      } else {
        dispatch(routerRedux.go(-1));
        // dispatch(routerRedux.goBack());
        // window.history.go(-1);
      }
    }

    const { rentDevInfo, match } = this.props;
    const { deviceID } = match.params;
    dispatch({
      type: 'snInput/queryRentDeviceInfo',
      payload: {deviceID},
    });
  }

  jssdkPre = () => {
    requestJssdkConfig(['chooseWXPay']).then((resp) => {
      this.jssdkReady = true;
    }).catch((err) => console.log('chooseWXPay ready失败：', err));
  }

  handleSubmit = () => {
    const { dispatch, wxBoundStatus, match, priceId } = this.props;
    const { deviceID } = match.params;

    const uri = new URI(document.location.href);
    const query = uri.query(true);
    const { code } = query;

    dispatch({
      type: 'snInput/requestPay',
      payload: {
        deviceID,
        rentPriceID: priceId,
        wxOAuthCode: code,
      },
      callback: (resp) => {
        if (resp.errCode === 0) {
          this.wechatPay(resp.data.payParams);
        }
      },
    });
  }

  wechatPay = (payParams) => {
    const { dispatch, wxBoundStatus } = this.props;
    const {timeStamp, nonceStr, prepayId, signType, sign } = payParams;
    window.wx.chooseWXPay({
      timestamp: timeStamp,
      nonceStr,
      package: 'prepay_id=' + prepayId,
      signType,
      paySign: sign,
      success: function(res) {
        setGlobalToast(true, '支付成功');
        dispatch(routerRedux.go(-2));
        // dispatch(routerRedux.push('/'));
      },
      fail: function() {
        setGlobalToast(true, '支付失败');
      },
      cancel: function() {
        setGlobalToast(true, '取消了支付');
      },
    });
  }
  
  generateList = (list) => {
    const { priceId } = this.props;
    return list.map((item) => {
      return (
        <p
          className={styles.item}
          key={item.id}
          onClick={() => { this.savePriceId(item.id) }}
        >
          <img src={priceId === item.id ? danxuan_select:danxuan_normal}/>
          {`${item.price/100}元／${item.time/60}小时`}
        </p>
      );
    });
  }

  savePriceId = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type:'snInput/savePriceid',
      payload: id,
    });
  }

  render() {
    const { rentDevInfo } = this.props;
    if (!rentDevInfo) return null;

    const { payText, lastRentInfo } = rentDevInfo;
    let rentStartTime;
    if (lastRentInfo) rentStartTime = lastRentInfo.rentStartTime;

    return (
      <div className={styles.payPage}>
        <div className={styles.recentInfo}>
          <p>上次使用时间 {rentStartTime ? moment.unix(rentStartTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</p>
          <PmIndicator deviceData={rentDevInfo.deviceData}/>
          <p>{rentDevInfo.payText}</p>
        </div>
        <div className={styles.infoItems}>
          { this.generateList(rentDevInfo.rentPrices)}
          <Button onClick={this.handleSubmit} className={styles.sure}>
            { rentDevInfo.owner ? '续租' : '确定'}
          </Button>
        </div>
        {
          this.state.popupShow ?
          <div
            className={styles.mask}
            onClick={e => this.setState({popupShow: false}) }
          >
            <div className={styles.dialog}>
              <img src={ dev_pic } />
              <p>{payText}</p>
              <Button>关闭</Button>
            </div>
          </div> : null
       }
      </div>
    );
  }
};

const mapStateToProps = state => ({
  rentDevInfo: state.snInput.rentDevInfo,
  priceId: state.snInput.priceId,
});
export default connect(mapStateToProps)(Pay);

