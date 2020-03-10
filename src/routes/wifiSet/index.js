import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Switch,
  FormCell,
  Form,
  Input,
  Label,
  Button,
  Toast,
} from 'react-weui';

import { requestJssdkConfig, setGlobalToast } from '../../utils/util.js';
import styles from './index.less';
import wifi_icon from '../../assets/deviceDetail/wifi_icon.png';

class WifiSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wifiName: '',
      wifiPwd: '',
    };

  }

  componentDidMount(){
    document.title = '配备设置';

  }
  componentWillUnmount() {
    this.toastTimer && clearTimeout(this.toastTimer);
  }
  
  wifiChange = (e) => {
    let value = e.target.value.trim();
    this.setState(() => ({
      wifiName: value,
    }));
  }

  pwdChange = (e) => {
    let value = e.target.value;
    this.setState(() => ({
      wifiPwd: value,
    }));
  }

  handleSubmit = () => {
    const { wifiName, wifiPwd } = this.state;
    // if (!wifiName) {
    //   setGlobalToast(true, '请输入wifi名');
    //   return;
    // }
    // if (!wifiPwd) {
    //   setGlobalToast(true, '请输入wifi密码');
    //   return;
    // }

    this.openAirkiss();
  }

  openAirkiss = () => {
    requestJssdkConfig(['configWXDeviceWiFi']).then(() => {
      alert('airkiss is ready！');

      window.wx.invoke(
        'configWXDeviceWiFi',
        {},
        function(res){
          var err_msg = res.err_msg;
          alert(JSON.stringify(res));
          if(err_msg == 'configWXDeviceWiFi:ok') {
            setGlobalToast(true, '配置成功');
            console.log('配置成功');
          } else {
            setGlobalToast(true, '配置失败');
            console.log('配置失败');
          }
        }
      );
    }).catch((err) => console.log('airkiss ready失败：', err));
  }
  
  render() {
    const { deviceDetail } = this.props;
    return (
      <div className={styles.wifiPage}>
        <p className={styles.wifi_icon}><img src={wifi_icon}/></p>
        <Form ref={e => { this.form = e }}>
          <FormCell>
            <CellHeader>wifi</CellHeader>
            <CellBody>
              <Input type="tel" placeholder="请输入wifi名称" onChange={this.wifiChange}
              value={ this.state.wifiName }/>
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>密码</CellHeader>
            <CellBody>
              <Input
                type="password"
                placeholder="请输入wifi密码"
                onChange={this.pwdChange}
                value={ this.state.wifiPwd }
              />
            </CellBody>
          </FormCell>
        </Form>

        <Button onClick={this.handleSubmit} style={{marginTop:'80px'}}>添加</Button>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceDetail: state.deviceDetailPage.deviceDetail,
});
export default connect(mapStateToProps)(WifiSet);

