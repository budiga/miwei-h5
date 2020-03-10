import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import URI from 'urijs';
import {
  Cells,
  Cell,
  CellBody,
  CellFooter,
  Switch,
  Button,
  ButtonArea,
  Dialog,
  Progress,
} from 'react-weui';
import MySlider from '../../components/mySlider';
import styles from './index.less';
import { requestJssdkConfig, setGlobalToast, isAndroid, getAddrText } from '../../utils/util.js';

class DeviceSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilter: false,

      dialogShow: false,
      dialogText: '',
      dialogBtns: {
        buttons: [
          {
            label: '取消',
            onClick: this.hideDialog,
          },
          {
            label: '确定',
            onClick: this.reqOTA,
          }
        ]
      },
    };

    const uri = new URI(document.location.href);
    const query = uri.query(true);
    const { isRent, deviceType } = query;
    this.isRent = (isRent == 'true');
    this.isTestDev = (deviceType == '1');
  }

  componentDidMount() {
    document.title = '设备设置';
  }
  componentWillMount() {
    const hasReload = localStorage.getItem('devSetPageHasReload');
    if (!hasReload && !isAndroid()) {
      localStorage.setItem('devSetPageHasReload', 'true');
      window.location.reload();
      return;
    }

    if(isAndroid()) this.jssdkPre();
    this.fetchStrainers();
  }

  componentWillUnmount() {
    localStorage.removeItem('devSetPageHasReload');
  }

  fetchStrainers () {
    const { dispatch, deviceID } = this.props;

    dispatch({
      type: 'deviceDetailPage/fetchStrainers',
      payload: { deviceID },
    });
  }

  hideDialog = () => {
    this.setState({
      dialogShow: false,
      dialogText: '',
    });
  }
  sureDelete = () => {
    this.deleteDevice();
    this.setState({
      dialogShow: false,
      dialogText: '',
    });
  }

  jssdkPre = () => {
    requestJssdkConfig(['configWXDeviceWiFi', 'onMenuShareAppMessage']).then((resp) => {
      this.jssdkReady = true;
    }).catch((err) => console.log('airkiss ready失败：', err));
  }
  openAirkiss = () => {
    const {deviceDetail} = this.props;
    const { permission } = deviceDetail;
    if (permission < 3) {
      setGlobalToast(true, '无权限设置');
      return;
    }

    window.wx.invoke(
      'configWXDeviceWiFi',
      {},
      function(res){
        var err_msg = res.err_msg;
        if(err_msg == 'configWXDeviceWiFi:ok') {
          setGlobalToast(true, '配网成功');
        } else if(err_msg == 'configWXDeviceWiFi:cancel') {
          setGlobalToast(true, '取消配网');
        } else {
          setGlobalToast(true, '配网失败');
        }
      }
    );
  }
  shareDevice = () => {
    const { deviceDetail, userData } = this.props;
    const { deviceName, prodName, modelName, deviceID } = deviceDetail;
    const { nickName } = userData.userInfo;

    window.wx.onMenuShareAppMessage({
      title: '米微科技', // 分享标题
      desc: `来自${nickName}的米微${prodName}${deviceName}的分享，请点击链接查看设备。`,
      link: `${window.location.protocol}//${window.location.host}/addDevice?deviceID=${deviceID}`,
      imgUrl: 'https://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg',
      type: 'link',
      success: function () { setGlobalToast(true, '分享成功') },
      fail: function () { setGlobalToast(true, '分享失败') },
      cancel: function () { setGlobalToast(true, '取消了分享') }
    });
    setGlobalToast(true, '请点击右上角分享给好友！');
  }
  deleteDevicePre = () => {
    this.setState({
      dialogShow: true,
      dialogText: '确定删除此设备吗？',
      dialogBtns: {
        buttons: [
          {
            label: '取消',
            onClick: this.hideDialog,
          },
          {
            label: '确定',
            onClick: this.sureDelete,
          }
        ]
      },
    });
  }
  deleteDevice = () => {
    const { dispatch, deviceID } = this.props;

    dispatch({
      type: 'deviceDetailPage/deleteDevice',
      payload: { deviceID },
      callback: () => {
        setGlobalToast(true, '删除成功');
        dispatch(routerRedux.go(-2)); // 返回首页
      }
    });
  }

  babyLockChange = (e) => {
    const {deviceDetail} = this.props;
    const { permission, deviceStatus } = deviceDetail;
    if (!deviceStatus.online) {
      setGlobalToast(true, '设备离线');
      return;
    }
    if (permission < 3) {
      setGlobalToast(true, '无权限设置');
      return;
    }

    const babyLock = e.target.checked;
    const { dispatch, deviceID } = this.props;
    dispatch({
      type: 'deviceDetailPage/setControl',
      payload: {
        deviceID,
        babyLock,
      },
      callback: (resp) => {
        if(resp.errCode === 0) setGlobalToast(true, '设置成功');
      }
    });
  }
  lightScreenChange = (e) => {
    const {deviceDetail} = this.props;
    const { permission, deviceStatus } = deviceDetail;
    if (!deviceStatus.online) {
      setGlobalToast(true, '设备离线');
      return;
    }
    if (permission < 3) {
      setGlobalToast(true, '无权限设置');
      return;
    }

    const screenSwitch = e.target.checked;
    const { dispatch, deviceID } = this.props;
    dispatch({
      type: 'deviceDetailPage/setControl',
      payload: {
        deviceID,
        screenSwitch,
      },
      callback: (resp) => {
        if(resp.errCode === 0) setGlobalToast(true, '设置成功');
      }
    });
  }

  geneStrainers(list) {
    if (list.length < 1) return null;

    return list.map(item => {
      let class_name = 'myProgress_green';
      if (item.alarm) class_name = 'myProgress_red';

      return (
        <div className={styles.sliderWraper}>
          <span>{item.strainerName}</span>
          <Progress value={item.reaminingRatio} className={class_name}/>
          <span onClick={() => { this.resetStrainer(item.strainerIndex) }}>复位</span>
        </div>
      );
    });
  }
  resetStrainer = (strainerIndex) => {
    const { dispatch, deviceID } = this.props;
    dispatch({
      type: 'deviceDetailPage/resetStrainer',
      payload: { deviceID, strainerIndex},
      callback: (resp) => {
        if (resp.errCode === 0) setGlobalToast(true, '设置成功');
      },
    });
  }
  strainerSure = () => {
    this.setState({
      showFilter: false,
    });
  }

  reqOTAPre = () => {
    this.setState({
      dialogShow: true,
      dialogText: '确定升级此设备吗？',
      dialogBtns: {
        buttons: [
          {
            label: '取消',
            onClick: this.hideDialog,
          },
          {
            label: '确定',
            onClick: this.reqOTA,
          }
        ]
      },
    });
  }
  reqOTA = () => {
    this.setState({
      dialogShow: false,
      dialogText: '',
    });
    
    const {deviceDetail} = this.props;
    const { permission, deviceStatus } = deviceDetail;
    if (!deviceStatus.online) {
      setGlobalToast(true, '设备离线');
      return;
    }
    if (permission < 7) {
      setGlobalToast(true, '无权限设置');
      return;
    }

    const { newestVerFw, verFW} = deviceDetail;
    if (newestVerFw === verFW) {
      setGlobalToast(true, '已是最新版本');
      return;
    }

    const { dispatch, deviceID } = this.props;
    dispatch({
      type: 'deviceDetailPage/requestOTA',
      payload: {deviceID},
      callback: (resp) => {
        if(resp.errCode === 0 && resp.data) {
          const { result } = resp.data;
          if(result === 0) {
            setGlobalToast(true, '升级成功');
          } else if(result === 1) {
            setGlobalToast(true, '升级进行中');
          } else if(result === 2) {
            setGlobalToast(true, '升级超时');
          } else if(result === 3) {
            setGlobalToast(true, '升级失败');
          }
        }
      }
    });

  }

  render() {
    const { deviceDetail, dispatch, deviceID, strainers } = this.props;
    const { deviceName, prodName, modelName, devicePos, deviceStatus, verFW, newestVerFw, permission } = deviceDetail;
    const { showFilter, dialogText, dialogShow, dialogBtns } = this.state;

    let addrText = '';
    if (devicePos) {
      if (devicePos.district && devicePos.district.addrCode) {
        addrText += getAddrText(devicePos.district.addrCode).join('');
      }
      if (devicePos.addrDetail) addrText += devicePos.addrDetail;
    }
    return (
      <div className={styles.deviceSetPage}>
        <Cells>
          <Cell access onClick={()=>{
            if (permission < 7) {
              setGlobalToast(true, '无权限设置');
              return;
            }
            dispatch(routerRedux.push('/devName'))
          }}>
            <CellBody>设备名称</CellBody>
            <CellFooter>{deviceName}</CellFooter>
          </Cell>
          <Cell access onClick={()=>{
            if (permission < 7) {
              setGlobalToast(true, '无权限设置');
              return;
            }
            dispatch(routerRedux.push('/devAddress/device'))
          }}>
            <CellBody>地理位置</CellBody>
            <CellFooter>{addrText}</CellFooter>
          </Cell>
        </Cells>

        <Cells>
          <Cell>
            <CellBody>MAC/IMEI</CellBody>
            <CellFooter>{deviceID}</CellFooter>
          </Cell>
          <Cell>
            <CellBody>固件版本</CellBody>
            <CellFooter>{verFW || 0}</CellFooter>
          </Cell>
          <Cell onClick={this.reqOTAPre} access>
            <CellBody>固件升级</CellBody>
            <CellFooter>{newestVerFw || '0'}</CellFooter>
          </Cell>
          <Cell>
            <CellBody>设备类型</CellBody>
            <CellFooter>{prodName}</CellFooter>
          </Cell>
          <Cell>
            <CellBody>设备型号</CellBody>
            <CellFooter>{modelName}</CellFooter>
          </Cell>
        </Cells>

        <Cells>
          <Cell onClick={this.openAirkiss}>
            <CellBody>配置网络</CellBody>
            <CellFooter>请点击</CellFooter>
          </Cell>
          {
            this.isTestDev ?
            null :
            <Cell access onClick={()=>{
              if (permission < 3) {
                setGlobalToast(true, '无权限设置');
                return;
              }
              dispatch(routerRedux.push('/matchDevice'))
            }}>
              <CellBody>关联设备</CellBody>
              <CellFooter/>
            </Cell>
          }
          <Cell onClick={this.shareDevice}>
            <CellBody>分享设备</CellBody>
            <CellFooter>请点击</CellFooter>
          </Cell>
          <Cell onClick={this.deleteDevicePre}>
            <CellBody>删除设备</CellBody>
            <CellFooter>请点击</CellFooter>
          </Cell>
        </Cells>

        <Cells>
          <Cell>
            <CellBody>婴儿锁</CellBody>
            <CellFooter>
              <Switch checked={deviceStatus.babyLock ? true:false} onChange={this.babyLockChange}/>
            </CellFooter>
          </Cell>
          <Cell>
            <CellBody>灯光面板</CellBody>
            <CellFooter>
              <Switch checked={deviceStatus.screenSwitch ? true:false} onChange={this.lightScreenChange}/>
            </CellFooter>
          </Cell>
        </Cells>
        {
          this.isTestDev ? null :
          <div style={{padding:'0 0.3rem'}}>
            <Button onClick={() => {
              if (!deviceStatus.online) {
                setGlobalToast(true, '设备离线');
                return;
              }
              if (permission < 7) {
                setGlobalToast(true, '无权限设置');
                return;
              }
              
              this.setState({showFilter:true});
            }}>滤网复位</Button>
          </div>
        }
        {
          showFilter ?
          <div className={styles.cover}>
            <div className={styles.filter}>
              <p className={styles.title}>滤网复位</p>
              {this.geneStrainers(strainers)}
              <ButtonArea direction="horizontal">
                <Button onClick={this.strainerSure}>确定</Button>
              </ButtonArea>
            </div>
          </div>
          : null
        }
        <Dialog
          type="ios"
          buttons={dialogBtns.buttons}
          show={dialogShow}
        >
         { dialogText }
        </Dialog>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceID: state.deviceDetailPage.deviceID,
  deviceDetail: state.deviceDetailPage.deviceDetail,
  strainers: state.deviceDetailPage.strainers,
  userData: state.user.userData,
});
export default connect(mapStateToProps)(DeviceSet);

