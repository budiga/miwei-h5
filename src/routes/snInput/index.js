import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'react-weui';
import { setGlobalToast, requestJssdkConfig, isAndroid } from '../../utils/util.js';


import styles from './index.less';

class SnInput extends React.Component {
  componentDidMount() {
    document.title = '手动输入';

    const { sn } = this.props;
    if (sn) this.sn = sn;
  }
  componentWillMount() {
    if(isAndroid()) this.jssdkPre();
  }
  jssdkPre = () => {
    requestJssdkConfig(['configWXDeviceWiFi']).then((resp) => {
      this.jssdkReady = true;
    }).catch((err) => console.log('configWXDeviceWiFi失败：', err));
  }
  openAirkiss = () => {
    try {
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
    } catch(e) {
      console.log(e);
    }
  }


  handleChange = (e) => {
    this.sn = e.target.value;
  }

  handleSubmit = () => {
    if (!this.sn) {
      setGlobalToast(true, '请输入设备sn号');
      return;
    }

    const { dispatch } = this.props;
    dispatch({
      type: 'snInput/fetchBasicInfo',
      payload: {
        deviceID: this.sn,
      },
      callback: (resp) => {
        if (resp.errCode === 0) {
          if (resp.data) dispatch(routerRedux.push(`/addDevice?deviceID=${this.sn}`));
          else this.openAirkiss();
        }
      },
    });
  }

  

  render() {
    const { sn } = this.props;
    return (
      <div className={styles.snInputPage}>
        <input
          placeholder="请输入设备SN号"
          defaultValue={sn}
          className={styles.snInput}
          onChange={this.handleChange}
        />
        
        <Button onClick={this.handleSubmit}>确定</Button>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  sn: state.snInput.sn,
});
export default connect(mapStateToProps)(SnInput);

