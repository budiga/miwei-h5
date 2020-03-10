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

import styles from './index.less';
import phone_icon from '../../assets/login/phone_icon.png'; 
import yanzhengma_icon from '../../assets/login/yanzhengma_icon.png';
import password_icon from '../../assets/login/password_iicon.png';
import { REGEXS } from '../../utils/constant';
import { setGlobalToast } from '../../utils/util.js';

class Register extends React.Component {
  constructor(props) {
    super(props);
    const { match } = props;
    this.type = match.params.type; // 注册 or 找回密码

    this.state = {
      phone: '',
      verifiedCode: '',
      userPwd_old: '',
      userPwd: '',
      pwd_comfirm: '',

      canSend: true,
      cutText: '获取验证码',
      showToast: false,
      toastText: '',
    };

  }

  componentDidMount(){
    if (this.type == 'default') document.title = '注册';
    else if(this.type == 'change') document.title = '修改密码';
    else document.title = '找回密码';
  }
  
  phoneChange = (e) => {
    let value = e.target.value.trim();
    this.setState(() => ({
      phone: value,
      canSend: value.length == 11,
    }));
  }
  codeChange = (e) => {
    let value = e.target.value;
    this.setState(() => ({
      verifiedCode: value,
    }));
  } 
  oldPwdChange = (e) => {
    let value = e.target.value;
    this.setState(() => ({
      userPwd_old: value,
    }));
  }
  pwdChange = (e) => {
    let value = e.target.value;
    this.setState(() => ({
      userPwd: value,
    }));
  }
  pwdComChange = (e) => {
    let value = e.target.value;
    this.setState(() => ({
      pwd_comfirm: value,
    }));
  }

  sendMsgReq = () => {
    const { canSend, phone } = this.state;
    if (!canSend) return;

    if (!phone) {
      setGlobalToast(true, '请输入手机号码');
      return;
    }

    if (!REGEXS.phone.test(phone)){
      setGlobalToast(true, '手机号码格式不正确');
      return;
    }

    const { dispatch } = this.props;
    dispatch({
      type: 'user/getVerifiedCode',
      payload: { phone },
      callback: (resp) => {
        if (resp.errCode === 0) {
          this.setState({ 
            canSend:false,
            cutText:'重新发送(60s)',
          });
          this.startCut();
        }
      },
    });
  }
  startCut = () => {
    let time = 60;
    this.timer = setInterval(() => {
      this.setState({ cutText:`重新发送(${--time}s)` });
      if (time == -1) {
        clearInterval(this.timer);
        this.setState({ canSend:true, cutText: '重新获取', });
      }
    },1000);
  }

  handleSubmit = () => {
    const { phone, verifiedCode, userPwd_old, userPwd, pwd_comfirm } = this.state;
    if (!phone) {
      setGlobalToast(true, '请输入手机号');
      return;
    }
    if (!REGEXS.phone.test(phone)){
      setGlobalToast(true, '手机号码格式不正确');
      return;
    }
    if (!verifiedCode) {
      setGlobalToast(true, '请输入验证码');
      return;
    }

    const isDefault = this.type === 'default';
    const isChange = this.type === 'change';
    if (isDefault) {
      if (!userPwd) {
        setGlobalToast(true, '请输入密码');
        return;
      }
    } else {
      if (isChange && !userPwd_old) {
        setGlobalToast(true, '请输入旧密码');
        return;
      }
      if (!userPwd) {
        setGlobalToast(true, '请输入新密码');
        return;
      }
    }
    if (userPwd.length < 6) {
      setGlobalToast(true, '密码长度不小于6位');
      return;
    }
    if (pwd_comfirm != userPwd) {
      setGlobalToast(true, '确认密码和密码不一致');
      return;
    }

    const { dispatch } = this.props;
    if (isDefault) {
      dispatch({
        type: 'user/register',
        payload: {
          verifiedCode,
          phone,
          userPwd,
        },
        callback: (resp) => {
          if (resp.errCode === 0){
            setGlobalToast(true, '注册成功');
            dispatch(routerRedux.go(-1));
          }
        },
      });
    } else if (isChange) {
      dispatch({
        type: 'user/changePassword',
        payload: {
          verifiedCode,
          phone,
          newPwd: userPwd,
          oldPwd: userPwd_old,
        },
        callback: (resp) => {
          if (resp.errCode === 0){
            setGlobalToast(true, '修改密码成功');
            dispatch(routerRedux.go(-1));
          }
        },
      });
    } else {
      dispatch({
        type: 'user/resetPassword',
        payload: {
          verifiedCode,
          phone,
          userPwd,
        },
        callback: (resp) => {
          if (resp.errCode === 0){
            setGlobalToast(true, '修改密码成功');
            dispatch(routerRedux.go(-1));
          }
        },
      });
    }
  }
  
  render() {
    const isChange = this.type === 'change';
    const isDefault = this.type === 'default';
    const { dispatch } = this.props;
    const { cutText, canSend } = this.state;

    return (
      <div className={styles.registerPage}>
        <Form>
          <FormCell>
            <CellHeader>
              <img src={phone_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>
              <Input
                type="number"
                maxLength={11}
                placeholder="请输入手机号"
                onChange={this.phoneChange}
                value={ this.state.phone }
              />
              <span
                className={styles.sendMsgReq}
                style={{ color: canSend ? '#23938b':'#999' }}
                onClick={this.sendMsgReq}
              >
                {cutText}
              </span>
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>
              <img src={yanzhengma_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>
              <Input
                type={this.state.pwdInputType}
                placeholder="请输入验证码"
                onChange={this.codeChange}
                value={ this.state.verifiedCode }
              />
            </CellBody>
          </FormCell>
          {
            isChange ?
             <FormCell>
              <CellHeader>
                <img src={password_icon} alt="" className={styles.list_icon}/>
              </CellHeader>
              <CellBody>
                <Input
                  type="password"
                  placeholder="输入旧密码"
                  onChange={this.oldPwdChange}
                  value={ this.state.userPwd_old }
                />
              </CellBody>
            </FormCell> : null
          }
          <FormCell>
            <CellHeader>
              <img src={password_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>
              <Input
                type="password"
                placeholder={ isDefault ? '密码，长度不小于6' : '新密码，长度不小于6'}
                onChange={this.pwdChange}
                value={ this.state.userPwd }
              />
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>
              <img src={password_icon} alt="" className={styles.list_icon}/>
            </CellHeader>
            <CellBody>
              <Input
                type="password"
                placeholder={ isDefault ? '确认密码' : '确认新密码'}
                onChange={this.pwdComChange}
                value={ this.state.pwd_comfirm }
              />
            </CellBody>
          </FormCell>
        </Form>
        <Button className={styles.submit} onClick={this.handleSubmit}>
          { isDefault ? '注册' : '修改'}
        </Button>

        <Toast className="my-weui-toast" show={this.state.showToast}>{this.state.toastText}</Toast>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user,
});
export default connect(mapStateToProps)(Register);

