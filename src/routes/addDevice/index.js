import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'react-weui';
import { setGlobalToast, setGlobalLoading, requestJssdkConfig, isAndroid } from '../../utils/util.js';
import { IMG_COMMON_URL } from '../../utils/constant';
import URI from 'urijs';


import styles from './index.less';

class AddDevice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    document.title = '添加设备';
  }
  componentWillMount() {
    if(isAndroid()) this.jssdkPre();

    const { dispatch } = this.props;
    const uri = new URI(document.location.href);
    const query = uri.query(true);
    this.deviceID = query.deviceID;

    dispatch({
      type: 'snInput/fetchBasicInfo',
      payload: {
        deviceID: this.deviceID,
      },
      callback: (resp) => {
        if (resp.errCode === 0 && !resp.data) {
          // dispatch(routerRedux.goBack());
          this.openAirkiss();
        }
      },
    });
  }
  componentWillUnmount() {
    setGlobalLoading(false);

    // 清除store里的basicInfo
    const { dispatch } = this.props;
    dispatch({
      type: 'snInput/saveBasicInfo',
      payload: null
    });
  }


  handleSubmit = () => {
    const { dispatch, basicInfo } = this.props;
    const { modelInfo, prodInfo, online, deviceOwnerExist, deviceID } = basicInfo;

    if (prodInfo.id == 0 && modelInfo.connWay == 1) { // 租赁设备

      if (online) {
        let cb = (resp) => {
          const rentDevInfo = resp.data.rentDevInfo;
          const { currentRentInfo:curRent } = rentDevInfo;
          if (curRent) {
            if (curRent.rentStatus === 0) {
              dispatch({
                type: 'global/setToast',
                payload: {
                  show: false,
                  text: '',
                },
              });
              dispatch(routerRedux.push(`/pay/${deviceID}`));
            } else {
              dispatch(routerRedux.push('/'));
            }
          } else { // 没有租赁信息则跳回首页
            dispatch(routerRedux.push('/'));
          }
        };

        this.addDevice(cb);
      } else {
        setGlobalToast(true, '设备离线，添加失败');
      }
    } else { // 销售设备
      if (deviceOwnerExist) {
        if (online) {
          let cb = () => {
            dispatch(routerRedux.push('/'));
          };
          this.addDevice(cb);
        } else {
          setGlobalToast(true, '设备离线，添加失败');
        }
      } else {
        if (online) {
          let cb = () => {
            dispatch(routerRedux.push('/'));
          };

          this.addDevice(cb);
        } else {
          this.openAirkiss();
        }
      }
    }
  }

  jssdkPre(){
    requestJssdkConfig(['getLocation', 'configWXDeviceWiFi']).then(() => {
      this.jssdkReady = true;
    }).catch((err) => {
      console.log(true, '配置失败');
    });
  }
  openAirkiss = () => {
    const that = this;
    window.wx.invoke(
      'configWXDeviceWiFi',
      {},
      function(res){
        var err_msg = res.err_msg;
        if(err_msg == 'configWXDeviceWiFi:ok') {
          setGlobalToast(true, '配网成功');

          setGlobalLoading(true);
          setTimeout(() => {
            setGlobalToast(true, '正在尝试添加设备...');
          }, 2000);
          that.queryStartTime = new Date().getTime();
          that.queryOnline();
        } else if(err_msg == 'configWXDeviceWiFi:cancel') {
          setGlobalToast(true, '取消配网');
        }  else {
          setGlobalToast(true, '配网失败');
        }
      }
    );
  }
  queryOnline = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'snInput/fetchBasicInfo',
      payload: {
        deviceID: this.deviceID,
      },
      callback: (resp) => {
        if (resp.errCode === 0 && resp.data) {
          if (resp.data.online) {
            let cb = () => {
              dispatch(routerRedux.push('/'));
            };
            this.addDevice(cb);
          } else {
            const curTime = new Date().getTime();
            if (curTime - this.queryStartTime <= 60 * 1000) {
              this.queryOnline()
            } else {
              setGlobalLoading(false);
              setGlobalToast(true, '不在线,添加设备失败');
              dispatch(routerRedux.goBack());
            }
          }
        }
      },
    });
  }


  addDevice = (cb) => {
    const { dispatch, basicInfo } = this.props;
    const deviceID = basicInfo.deviceID;

    window.wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        const { latitude, longitude } = res;

        dispatch({
          type: 'snInput/addDevice',
          payload: {
            deviceID: deviceID,
            latitude,
            longitude,
          },
          callback: (resp) => {
            if (resp.errCode === 0) {
              setGlobalToast(true, '添加成功');
              cb(resp);
            }
          },
        });
      },
      fail: function(res) {
        console.log(res);
      },
    });
  }

  render() {
    const { basicInfo } = this.props;
    if (!basicInfo) return null;

    const { modelInfo, deviceID, deviceName, prodInfo } = basicInfo;
    return (
      <div className={styles.addDevicePage}>
        <img src={ IMG_COMMON_URL + modelInfo.imageID}/>
        <div className={styles.infoItems}>
          <p className={styles.item}>
            <span>IMEI/MAC</span>
            <span>{deviceID}</span>
          </p>
          <p className={styles.item}>
            <span>设备名称</span>
            <span>{deviceName}</span>
          </p>
          <p className={styles.item}>
            <span>设备类型</span>
            <span>{prodInfo.name}</span>
          </p>
          <p className={styles.item}>
            <span>设备型号</span>
            <span>{modelInfo.name}</span>
          </p>
          <Button onClick={this.handleSubmit} className={styles.sure}>确定</Button>
        </div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  basicInfo: state.snInput.basicInfo,
});
export default connect(mapStateToProps)(AddDevice);

