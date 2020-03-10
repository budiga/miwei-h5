import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  CellHeader,
  CellBody,
  FormCell,
  Form,
  Input,
  Button,
  Toast,
} from 'react-weui';

import styles from './UserInfoChange.less';
import cancel_icon from '../../assets/login/cancel-icon.png';
import { setGlobalToast } from '../../utils/util';

class UserInfoChange extends React.Component {
  constructor(props) {
    super(props);
    const { userInfo } = props;
    
    this.state = {
      userInput: userInfo.nickName,
    };
  }

  componentDidMount() {
    document.title = '修改昵称';
    this.input = document.querySelector('.myInput');
    this.input.focus();
  }
  
  phoneChange = (e) => {
    let value = e.target.value.trim();
    this.setState(() => ({
      userInput: value,
    }));
  }
  clearPhone = () => {
    this.setState(() => ({
      userInput: '',
    }));

    if (this.input) this.input.focus();
  }

  handleSubmit = () => {
    const { userInput } = this.state;
    if (!userInput) {
      setGlobalToast(true, '请输入昵称');
      return;
    }

    const { dispatch } = this.props;
    dispatch({
      type: 'user/editUserInfo',
      payload: { nickName: userInput },
      callback: (resp) => {
        if (resp.errCode === 0) {
          dispatch(routerRedux.goBack());
        }
      },
    });
  }
  
  render() {
    return (
      <div className={styles.userInfoChangePage}>
        <Form>
          <FormCell>
            <CellHeader>昵称</CellHeader>
            <CellBody>
              <Input
                type="text"
                className="myInput"
                placeholder="请输入昵称"
                onChange={this.phoneChange}
                value={ this.state.userInput }
              />
              {
                this.state.userInput ?
                <img src={cancel_icon} alt="" className={styles.cancel_icon} onClick={this.clearPhone}/>
                : null
              }
            </CellBody>
          </FormCell>
        </Form>
        <div className={styles.btnWraper}>
          <Button onClick={this.handleSubmit}>保存</Button>
        </div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  userInfo: state.user.userData.userInfo,
});
export default connect(mapStateToProps)(UserInfoChange);

