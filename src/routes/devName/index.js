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

import { setGlobalToast } from '../../utils/util.js';
import styles from './index.less';
import cancel_icon from '../../assets/login/cancel-icon.png';

class DevName extends React.Component {
  constructor(props) {
    super(props);
    const { deviceName } = props;
    
    this.state = {
      userInput: deviceName,
    };
  }

  componentDidMount() {
    document.title = '修改设备名称';

    this.input = document.querySelector('.myInput');
    this.input.focus();
  }
  componentWillUnmount() {
    this.toastTimer && clearTimeout(this.toastTimer);
  }
  
  handleChange = (e) => {
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
    const { dispatch, deviceID } = this.props;
    const { userInput } = this.state;
    if (!userInput) {
      setGlobalToast(true, '请输入设备名称');
      return;
    }

    dispatch({
      type: 'deviceDetailPage/modifyDevice',
      payload: { deviceID, deviceName: userInput },
      callback: (resp) => {
        if (resp.errCode === 0) {
          setGlobalToast(true, '修改成功');
          dispatch(routerRedux.goBack());
        }
      }
    });

    
  }
  
  render() {
    const { userInput } = this.state;
    return (
      <div className={styles.devNamePage}>
        <Form>
          <FormCell>
            <CellHeader>设备名称</CellHeader>
            <CellBody>
              <Input
                type="text"
                className="myInput"
                placeholder="请输入"
                onChange={this.handleChange}
                value={userInput}
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
  deviceID: state.deviceDetailPage.deviceID,
  deviceName: state.deviceDetailPage.deviceDetail.deviceName,
});
export default connect(mapStateToProps)(DevName);

