import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from 'react-weui';

import styles from './Me.less';
import setting_img from '../../assets/home/setting_icon.png';
import password_icon from '../../assets/home/password_icon.png';
import order_icon from '../../assets/home/dingdanzhongxin_icon.png';
import warn_icon from '../../assets/home/baojing_icon.png';
import suggest_icon from '../../assets/home/yijian_icon.png';
import about_icon from '../../assets/home/guanyu_icon.png';
import exit_icon from '../../assets/home/exit_icon.png';
import avatar_icon from '../../assets/home/touxiang_icon.png';
import { getAddrText } from '../../utils/util';
import { IMG_COMMON_URL } from '../../utils/constant';

class Me extends React.Component {
  constructor(props){
    super(props);
  }

  toAbout = () => {
    this.props.dispatch(routerRedux.push('/about'));
  }

  exit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/logout',
      callback: (resp) => {
        localStorage.removeItem('miwei_root_cache');
        localStorage.removeItem('persist:miweih5_root');
        dispatch(routerRedux.push('/login'));
      },
    });
  }

  render(){
    const { userData, dispatch } = this.props;
    const { userInfo } = userData;

    const { addrDetail, district, portraitID } = userInfo;
    let addrCode;
    if (district) addrCode = district.addrCode;

    let addrText = '';
    if (addrCode) {
      addrText += getAddrText(addrCode).join('') + addrDetail;
    }

    let avatarSrc = '';
    if (portraitID) avatarSrc = IMG_COMMON_URL + portraitID;

    return (
      <div className={styles.mePage}>
        <div
          className={styles.info}
        >
          <img src={ avatarSrc || avatar_icon} className={styles.avatar}/>
          <img src={setting_img}
          className={styles.setting}
          onClick={() => {dispatch(routerRedux.push('/userSetting'))}}
          />
          <p>{ userInfo.nickName || '暂无昵称'}</p>
          <p className={styles.address}>{ addrText || '暂无地址' }</p>
        </div>
        <Cells>
          <Cell access onClick={ ()=>{dispatch(routerRedux.push('/register/change'))} }>
            <CellHeader>
              <img src={password_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>修改密码</CellBody>
            <CellFooter/>
          </Cell>
          <Cell access onClick={ ()=>{dispatch(routerRedux.push('/orderList'))} }>
            <CellHeader>
                <img src={order_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>订单中心</CellBody>
            <CellFooter/>
          </Cell>
          <Cell access onClick={ ()=>{dispatch(routerRedux.push('/alarmSet'))} }>
            <CellHeader>
                <img src={warn_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>报警管理</CellBody>
            <CellFooter/>
          </Cell>
          <Cell access onClick={ ()=>{dispatch(routerRedux.push('/suggest'))} }>
            <CellHeader>
                <img src={suggest_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>意见反馈</CellBody>
            <CellFooter/>
          </Cell>
        </Cells>
        <Cells>
          <Cell access onClick={ ()=>{dispatch(routerRedux.push('/about'))} }>
            <CellHeader>
              <img src={about_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>关于米微</CellBody>
            <CellFooter/>
          </Cell>
        </Cells>
        <Cells>
          <Cell access onClick={ this.exit }>
            <CellHeader>
              <img src={exit_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>退出</CellBody>
            <CellFooter/>
          </Cell>
        </Cells>
      </div>);
  }
}

const mapStateToProps = state => ({
  userData: state.user.userData,
});
export default connect(mapStateToProps)(Me);

