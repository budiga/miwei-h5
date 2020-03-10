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
import URI from 'urijs';

import styles from './index.less';
import logo_png from '../../assets/login/logo.png';
import phone_icon from '../../assets/login/phone_icon.png'; 
import password_icon from '../../assets/login/password_iicon.png';
import cancel_icon from '../../assets/login/cancel-icon.png';
import eye_icon from '../../assets/login/eye-icon.png';
import weixin_icon from '../../assets/login/weixin_icon.png';
import { REGEXS } from '../../utils/constant';
import { setGlobalToast, setGlobalLoading, setGlobalDialog } from '../../utils/util.js';
import { wechatAuth } from '../../utils/authority.js';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '',
      userPwd: '',
      inputType: 'password',

      isFocused: false,
    };
  }

  componentDidMount(){
    document.title = '登录';

    // 判断url中是否有code，有则进行微信登录
    this.shouldWechatLogin();
  }

  shouldWechatLogin() {
    const { dispatch, wxBindCode } = this.props;
    if(wxBindCode) return;

    const uri = new URI(document.location.href);
    const query = uri.query(true);
    const { code } = query;
    if (!code) return;

    dispatch({
      type: 'user/login',
      payload: {
        loginType: 1,
        withUserInfo: true,
        wxOAuthCode: code,
      },
      callback: (resp) => {
        if (resp.errCode === 525) { // 该微信未绑定 需先绑定
          setGlobalToast(true, '输入账号和密码进行绑定');
          dispatch({
            type: 'user/setWxBindCode',
            payload: resp.data.wxBindCode,
          });
          return;
        }

        if (resp.errCode === 0) {
          dispatch(routerRedux.go(-2));
          // dispatch(routerRedux.push('/'));
        }
      },
    });
  }

  
  phoneChange = (e) => {
    let value = e.target.value.trim();
    this.setState(() => ({
      userPhone: value,
    }));
  }
  clearPhone = () => {
    this.setState(() => ({
      userPhone: '',
    }));
  }
  pwdChange = (e) => {
    let value = e.target.value;
    this.setState(() => ({
      userPwd: value,
    }));
  }
  showHidePwd = () => {
    if (this.state.inputType === 'password') this.setState(() => ({inputType: 'text'}));
    else this.setState(() => ({inputType: 'password'}));
  }

  handleSubmit = (e) => {
    const { userPhone, userPwd } = this.state;
    if (!userPhone) {
      setGlobalToast(true, '请输入手机号');
      return;
    }
    if (!REGEXS.phone.test(userPhone)){
      setGlobalToast(true, '手机号码格式不正确');
      return;
    }
    if (!userPwd) {
      setGlobalToast(true, '请输入密码');
      return;
    }
    const { dispatch, wxBindCode } = this.props;
    if (wxBindCode) {
      dispatch({
        type: 'user/login',
        payload: {
          loginType: 1,
          withUserInfo: true,
          userPhone,
          userPwd,
          wxBindCode,
        },
        callback: (resp) => {
          if (resp.errCode === 0) {
            dispatch({
              type: 'user/setWxBindCode',
              payload: '',
            });
            dispatch(routerRedux.go(-2));
            // dispatch(routerRedux.push('/'));
          }
        },
      });
    } else {
      dispatch({
        type: 'user/login',
        payload: {
          loginType: 1,
          withUserInfo: true,
          userPhone,
          userPwd,
        },
        callback: (resp) => {
          if (resp.errCode === 0) {
            dispatch(routerRedux.go(-1));
            // dispatch(routerRedux.push('/'));
          }
        },
      });
    }
  }
  
  render() {
    const { dispatch, wxBindCode } = this.props;
    const { hideWechatLogin, isFocused } = this.state;
    return (
      <div className={styles.loginPage}>
        <p className={styles.logo}><img src={logo_png}/></p>
        <Form ref={e => { this.form = e }}>
          <FormCell>
            <CellHeader>
              <img src={phone_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>
              <Input
                type="tel"
                placeholder="请输入手机号"
                onChange={this.phoneChange}
                value={ this.state.userPhone }
                onFocus={()=>{ this.setState({isFocused:true}) }}
                onBlur={()=>{ this.setState({isFocused:false}) }}
              />
              {
                this.state.userPhone ?
                <img src={cancel_icon} alt="" className={styles.cancel_icon} onClick={this.clearPhone}/>
                : null
              }
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>
              <img src={password_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>
              <Input
                type={this.state.inputType}
                placeholder="请输入密码"
                onChange={this.pwdChange}
                value={this.state.userPwd}
                onFocus={()=>{ this.setState({isFocused:true}) }}
                onBlur={()=>{ this.setState({isFocused:false}) }}
              />
              <img src={eye_icon} alt="" className={styles.eye_icon}
              onClick={this.showHidePwd}/>
            </CellBody>
          </FormCell>
        </Form>
        {
          wxBindCode ?
          null :
          <p className={styles.wechatLogin}>
            <span onClick={() => {wechatAuth()}}><img src={weixin_icon} />微信登录</span>
          </p>
        }
        <Button onClick={this.handleSubmit} style={{marginTop:'22px'}}>{wxBindCode ? '绑定' : '登录'}</Button>
        <p className={styles.toRegister}>
          <Link to="/register/default">注册</Link>
        </p>
        
        <p className={styles.forget}
        style={{
          position: isFocused ? 'relative' : 'absolute',
          bottom: isFocused ? -10 : 30,
        }}>
          <Link to="/register/forget">忘记密码</Link>
        </p>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  wxBindCode: state.user.wxBindCode,
});
export default connect(mapStateToProps)(Login);

