import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import URI from 'urijs';
import { Tab, TabBarItem, ActionSheet } from 'react-weui';

import Devices from './Devices';
import Messages from './Messages';
import Me from './Me';
import { requestJssdkConfig, setGlobalToast, isAndroid } from '../../utils/util.js';

import icon_devices from '../../assets/home/shebei_select.png';
import icon_devices_o from '../../assets/home/shebei_normal.png';
import icon_msg from '../../assets/home/message_select.png';
import icon_msg_o from '../../assets/home/message_normal.png';
import icon_me from '../../assets/home/geren_select.png';
import icon_me_o from '../../assets/home/geren_normal.png';
import './index.less';

class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      show: false,
      menus: [
        {
          label: '扫描',
          onClick: this.scanQRCode,
        },
        {
          label: '手动输入',
          onClick: this.jump2SnInput,
        },
      ],
      actions: [
        {
          label: '取消',
          onClick: (e) => { this.setState({show: false}) },
        },
      ]
    };

    this.jssdkReady = false;
  }

  componentWillMount(){
    const { dispatch } = this.props;
    const cache = localStorage.getItem('miwei_root_cache');
    if (cache) {
      dispatch({
        type: 'user/queryUserInfo',
      });
    } else {
      dispatch({
        type: 'user/setWxBindCode',
        payload: '',
      });
      setTimeout(()=> {
        dispatch(routerRedux.push('/login'));
      }, 300);
    }
    
    if (isAndroid()){
      this.jssdkPre(['scanQRCode']);
    }
  }

  componentDidMount() {
    const { tabIndex } = this.props;
    this.setTitle(tabIndex);

    setGlobalToast(false, '');
    localStorage.removeItem('devSetPageHasReload');
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabIndex === 2 && this.props.tabIndex !== 2) {
      this.props.dispatch({
        type: 'user/queryUserInfo',
      });
    }
  }

  jssdkPre = (apiList, url) => {
    requestJssdkConfig(apiList, url).then(() => {
      this.jssdkReady = true;
    }).catch((err) => console.log(JSON.stringify(err)));
  }

  jump2SnInput = () => {
    this.setState({show: false});
    
    const { dispatch } = this.props;
    dispatch(routerRedux.push('/snInput'));
  }

  scanQRCode = () => {
    this.setState({show: false});

    const { dispatch } = this.props;
    window.wx.scanQRCode({
      needResult: 1,
      desc: 'scan desc',
      success: function (res) {
        const QRCodeUrl = res.resultStr;
        const uri = new URI(QRCodeUrl);
        const query = uri.query(true);
        const { deviceID } = query;
        dispatch(routerRedux.push(`/addDevice?deviceID=${deviceID}`));
      },
      error: function (res) {
        alert(JSON.stringify(res));
      }
    });
  }

  setTabIndex = (index) => {
    this.props.dispatch({
      type: 'home/setTabIndex',
      payload: index,
    });
  }

  setTitle = (index) => {
    if (index === 0) document.title = '设备列表';
    else if (index === 1) document.title = '消息中心';
    else if (index === 2) document.title = '个人设置';
  }

  clickScan = () => {
    this.setState({show: true});
  }

  render() {
    const { userData, tabIndex, dispatch} = this.props;
    if (!userData) return null;

  	return (
      <>
        <Tab
          type="tabbar"
          onChange={this.setTabIndex}
          defaultIndex={tabIndex}
        >
          <TabBarItem
            label="设备列表"
            icon={<img alt="" src={tabIndex === 0 ? icon_devices : icon_devices_o}/>}
          >
            <Devices clickScan={this.clickScan}/>
          </TabBarItem>
          <TabBarItem
            label="消息"
            icon={<img alt="" src={tabIndex === 1 ? icon_msg : icon_msg_o}/>}
          >
            <Messages dispatch={dispatch}/>
          </TabBarItem>
          <TabBarItem
            label="个人"
            icon={<img alt="" src={tabIndex === 2 ? icon_me : icon_me_o}/>}
          >
            <Me dispatch={dispatch}/>
          </TabBarItem>
        </Tab>
        <ActionSheet
          type="ios"
          menus={this.state.menus}
          actions={this.state.actions}
          show={this.state.show}
          onRequestClose={e=>this.setState({show:false})}
        />
      </>
    )
  }
}

const mapStateToProps = state => ({
  userData: state.user.userData,
  tabIndex: state.home.tabIndex,
});
export default connect(mapStateToProps)(Home);
