import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import URI from 'urijs';
import { routerRedux } from 'dva/router';

import { setGlobalToast } from '../../utils/util.js';
import PmIndicator from '../../components/pmIndicator';
import OnOff from '../../components/onOff';
import MyChart from '../../components/myChart';
import TimeCut from '../../components/timeCut';
import styles from './index.less';
import location_png from '../../assets/location.png';
import mall_png from '../../assets/deviceDetail/shangcheng_icon.png';
import pay_png from '../../assets/deviceDetail/xufei_icon.png';
import { secToHour, getAddrText, setGlobalDialog } from '../../utils/util';

class DeviceDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSetting: false // 是否正在设置
    };

    const uri = new URI(document.location.href);
    const query = uri.query(true);
    const { isRent, deviceType, deviceID } = query;
    this.isRentText = isRent, this.deviceTypeText = deviceType;

    this.isRent = (isRent == 'true');
    this.isTestDev = (deviceType == '1');
    this.hasShowRentNotice = false;
    this.deviceID = deviceID;
    this.preStatus = null; // 保存设备的之前的开关、辅热等状态
  }

  componentDidMount() {
    document.title = '设备详情';

    this.fetchDetail();
    this.intervalId = setInterval(this.fetchDetail, 10000);

    if (!this.isRent) { // 销售设备需查询统计
      this.fetchBarData(0);
      this.fetchLineData(0);
    }
  }
  componentWillUnmount(){
    if (this.intervalId) clearInterval(this.intervalId);
  }

  fetchDetail = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/fetchDetail',
      payload: {deviceID: this.deviceID},
      callback: (resp) => {
        if (resp.errCode === 0) {
          this.preStatus = resp.data.deviceStatus;

          if (this.isRent && (!this.hasShowRentNotice)) {
            let time = resp.data.rentInfo.rentRemainingTime;
            if (time && time > 0 && time < 10 * 60 ) { // 10分钟
              this.hasShowRentNotice = true;
              setGlobalDialog(true, '租赁时长将到期，到时请点击续费继续使用。');
            }
          }
        }
      }
    });
  }

  fetchLineData(dateType) {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/fetchLineData',
      payload: {
        deviceID: this.deviceID,
        type: dateType
      },
    });
  }
  fetchBarData(dateType) {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/fetchBarData',
      payload: {
        deviceID: this.deviceID,
        type: dateType
      },
    });
  }
  setLineDateType = (type) => {
    this.fetchLineData(type);
  }
  setBarDateType = (type) => {
    this.fetchBarData(type);
  }

  getDateStr(s) {
    return moment.unix(s).format('YYYY-MM-DD HH:mm:ss');
  }
  getFixed(num, len) {
    if(num) {
      if (typeof num === 'string'){
        return parseFloat(num).toFixed(len || 0);
      }
      return num.toFixed(len || 0);
    }

    return new Number('0').toFixed(len || 0);
  }

  clickCb = (target, value) => {
    const { dispatch, deviceDetail} = this.props;
    const { deviceStatus, deviceID, permission } = deviceDetail;

    if (target == 'set') {
      dispatch(routerRedux.push(`/deviceSet?isRent=${this.isRentText}&deviceType=${this.deviceTypeText}`));
      return;
    }

    if (this.state.isSetting && target !== 'time') {
      setGlobalToast(true, '控制忙，请稍后');
      return;
    }

    const { online, powerOn } = deviceStatus;
    if (!online) {
      setGlobalToast(true, '设备不在线');
      return;
    }

    if (permission < 3) {
      setGlobalToast(true, '无设置权限');
      return;
    }


    const params = { deviceID };
    if (target == 'onoff') {
      params.powerOn = !powerOn;
    } else if (target == 'wind') {
      params.ventilationMode = value;
    } else if (target == 'heat') {
      if (this.isTestDev) {
        setGlobalToast(true, '检测仪无法设置此项');
        return;
      }
      if (!powerOn) {
        setGlobalToast(true, '设备关机，无法设置');
        return;
      }
      params.auxiliaryHeat = !deviceStatus.auxiliaryHeat;
    } else if (target == 'speed') {
      params.airSpeed = value;
    } else if (target == 'time') {
      if (this.isTestDev) {
        setGlobalToast(true, '检测仪无法设置此项');
        return;
      }
      dispatch(routerRedux.push('/timerSet'));
      return;
    }

    this.setState({ isSetting: true });
    // 发送请求给后台,将设置的值立即更新，然后再轮训10次
    dispatch({
      type: 'deviceDetailPage/setControl',
      payload: params,
    });
    let temp = { ...params };
    delete temp.deviceID;
    dispatch({
      type: 'deviceDetailPage/saveControl',
      payload: temp
    });
    this.startQueryStatusTenTimes(temp);
  }
  startQueryStatusTenTimes = (temp) => {
    if (this.intervalId) clearInterval(this.intervalId);

    const { dispatch } = this.props;
    const keyStr =  Object.keys(temp)[0];
    const oldValue = this.preStatus[keyStr];
    let count = 0;

    this.intervalId = setInterval(() => {
      count++;
      // console.log('请求了'+count+'次！');
      if (count <= 10) {
        let curNum = count;
        dispatch({
          type: 'deviceDetailPage/fetchDetail',
          payload: {deviceID: this.deviceID, reqOnlyForSet: true},
          callback: (resp) => {
            if (resp.errCode === 0) {
              const { deviceStatus } = resp.data;
              const newValue = deviceStatus && deviceStatus[keyStr];
              if (newValue != oldValue) { // 设置成功
                setGlobalToast(true, '设置成功');
                this.setState({ isSetting: false });
                this.resumeNormalRequest();
                this.preStatus = { ...this.preStatus, ...temp };
              } else { // 设置失败
                if (curNum === 10) {
                  setGlobalToast(true, '设置失败');
                  this.setState({ isSetting: false });
                  this.resumeNormalRequest();
                  // 设置回之前的值
                  const preValue = { [keyStr]: oldValue };
                  dispatch({
                    type: 'deviceDetailPage/saveControl',
                    payload: preValue
                  });
                }
              }
            } else {
              if (curNum === 10) {
                setGlobalToast(true, '设置失败');
                this.setState({ isSetting: false });
                this.resumeNormalRequest();
                // 设置回之前的值
                const preValue = { [keyStr]: oldValue };
                dispatch({
                  type: 'deviceDetailPage/saveControl',
                  payload: preValue
                });
              }
            }
          }
        });
      }
    }, 2000);
  }
  resumeNormalRequest = () => { // 恢复每10s请求一次详情
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.fetchDetail, 10000);
  }

  toPayPage = () => {
    const { dispatch, deviceDetail } = this.props;
    dispatch(routerRedux.push(`/pay/${deviceDetail.deviceID}`));
  }
  toMiweiMall = () => {
    window.location.href = 'http://mall.mivei.com/m/?tid=97539';
  }

  render() {
    const { deviceDetail, pm25History, deconHistory, dispatch } = this.props;
    if (!deviceDetail) return null;

    const { deviceData, devicePos, rentInfo, permission, deviceStatus, pm25AirText, pm25RankText } = deviceDetail;

    let bgColor_class = 'deviceDetailPage';
    if (deviceData) {
      const { aqLevel } = deviceData;
      if (aqLevel === 1) {
        bgColor_class = 'deviceDetailPage_worse';
      } else if (aqLevel === 2) {
        bgColor_class = 'deviceDetailPage_worser';
      } else if (aqLevel === 3) {
        bgColor_class = 'deviceDetailPage_worsest';
      }
    }
    return (
      <div className={styles[bgColor_class]}>
        {
          this.isRent ? null :
          <div className={styles.deviceInfo}>
            <p>
              <img src={location_png} />
              <span>{devicePos?getAddrText(devicePos.district.addrCode).join(''):'--'}</span>
            </p>
            <p>
              { deviceDetail.deviceName+ ' ' + moment().format('YYYY-MM-DD HH:mm:ss')}
            </p>
          </div>
        }
        <PmIndicator deviceData={deviceData}/>
        {
          this.isRent ?
          <div className={styles.deviceInfo} style={{marginTop:'0.4rem'}}>
            <p>
              <img src={location_png} />
              <span>{devicePos?getAddrText(devicePos.district.addrCode).join(''):'--'}</span>
            </p>
            <p>
              {`${(deviceData&&deviceData.lastUpdateTime)?this.getDateStr(deviceData.lastUpdateTime):'00:00:00'}`}
              {
                rentInfo ?
                <span style={{marginLeft:'0.4rem'}}>{`${rentInfo.price/100}元／${rentInfo.rentTime/60}小时`}</span>
                :
                <span style={{marginLeft:'0.4rem'}}>0.00元/0小时</span>
              }
            </p>
          </div>
          : null
        }
        
        {
          this.isRent ?
          <div className={styles.shopmall}>
            <div className={styles.mall} onClick={this.toMiweiMall}>
              <img src={mall_png}/><span>商城</span>
            </div>
            <TimeCut remainTime={rentInfo?(rentInfo.rentRemainingTime?rentInfo.rentRemainingTime:0):0}/>
            <div
              className={styles.mall}
              onClick={this.toPayPage}
            >
              <img src={pay_png}/>
              <span onClick={()=>{dispatch(routerRedux.push(`/pay/${deviceDetail.deviceID}`));}}>续费</span>
            </div>
          </div>
          :
          <p className={styles.indicatorText}>{pm25AirText}</p>
        }
        {
          this.isRent ?
          <div className={styles.text}>{pm25RankText || '暂无数据'}</div>
          : null
        }
        <OnOff
          deviceStatus={deviceStatus}
          clickCb={this.clickCb}
          isTestDev={this.isTestDev}
          permission={permission}
          isSetting={this.state.isSetting}
        />
        <div className={styles.dataBox}>
          <p>
            <span>PM2.5:  {this.getFixed(deviceData.pm25)}</span>
            <span>CO2:  {this.getFixed(deviceData.co2, 2)}</span>
            <span>甲醛:  {this.getFixed(deviceData.ch2o, 2)}</span>
          </p>
          <p>
            <span>TCOV:  {this.getFixed(deviceData.tvoc, 2)}</span>
            <span>温度:  {this.getFixed(deviceData.temp, 2)}</span>
            <span>湿度:  {this.getFixed(deviceData.humidity, 2)}</span>
          </p>
        </div>
        {
          this.isRent ? null :
          <div className={styles.text}>{pm25RankText || '暂无数据'}</div>
        }
        {
          this.isRent ?
          null :
          <>
            <MyChart
              title="污染指数变化"
              type="line"
              setDateType={this.setLineDateType}
              dataSource={pm25History}
            />
            <div style={{height: '0.24rem'}}/>
            <MyChart
              title="累计去处污染"
              type="bar"
              setDateType={this.setBarDateType}
              dataSource={deconHistory}
            />
          </>
        }
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceDetail: state.deviceDetailPage.deviceDetail,
  pm25History: state.deviceDetailPage.pm25History,
  deconHistory: state.deviceDetailPage.deconHistory,
});
export default connect(mapStateToProps)(DeviceDetail);

