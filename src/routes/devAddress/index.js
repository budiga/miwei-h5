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
  CityPicker,
} from 'react-weui';

import { setGlobalToast, getAddrCode, getAddrText } from '../../utils/util';
import cnData from '../../utils/city';
import styles from './index.less';
import cancel_icon from '../../assets/login/cancel-icon.png';

class DevAddress extends React.Component {
  constructor(props) {
    super(props);

    const { match, userData, deviceDetail } = props;

    let addrCode, addrDetail = '';
    this.type = match.params.type;
    if (this.type == 'userAddr') {
      const { userInfo } = userData;
      if (userInfo.district){
        addrCode = userInfo.district.addrCode;
        addrDetail = userInfo.addrDetail;
      }
    } else {
      const { devicePos } = deviceDetail;
      addrCode = devicePos.district.addrCode;
      addrDetail = devicePos.addrDetail;
    }

    const city_values = addrCode ? getAddrText(addrCode) : ['北京','北京市','东城区'];
    const city_value = city_values.join(' ')+ ' ';
    const { selected } = getAddrCode(city_value);
    
    this.state = {
      addrDetail,

      selected,
      city_value, // 省市区
      city_show: false,
    };

    this.addrCode = addrCode || 5738922241;
  }

  componentDidMount() {
    if (this.type == 'userAddr'){
      document.title = '修改地址';
    } else {
      document.title = '修改地址';
    }

    this.input = document.querySelector('.myInput');
    this.input.focus();
  }
  
  handleChange = (e) => {
    let value = e.target.value.trim();
    this.setState(() => ({
      addrDetail: value,
    }));
  }
  clearPhone = () => {
    this.setState(() => ({
      addrDetail: '',
    }));

    if (this.input) this.input.focus();
  }

  handleSubmit = () => {
    const { addrDetail } = this.state;
    if (!addrDetail) {
      setGlobalToast(true, '请输入地址详情');
      return;
    }
    if (!this.addrCode) {
      setGlobalToast(true, '请选择区域');
      return;
    }

    const { dispatch } = this.props;
    if (this.type == 'userAddr'){
      dispatch({
        type: 'user/editUserInfo',
        payload: { addrDetail, addrCode:this.addrCode },
        callback: (resp) => {
          if (resp.errCode === 0) {
            setGlobalToast(true, '修改成功');
            dispatch(routerRedux.goBack());
          }
        }
      });
    } else {
      const { deviceID } = this.props;
      dispatch({
        type: 'deviceDetailPage/modifyDevice',
        payload: { deviceID, addrDetail, addrCode:this.addrCode },
        callback: (resp) => {
          if (resp.errCode === 0) {
            setGlobalToast(true, '修改成功');
            dispatch(routerRedux.goBack());
          }
        }
      });
    }
  }

  cityChange = (text) => {
    const rst = getAddrCode(text);

    this.setState({
      selected: rst.selected,
      city_value: text,
      city_show: false,
    });

    let addrCodeStr = '0x156' + rst.code;
    this.addrCode = parseInt(addrCodeStr);
  }
  
  render() {
    const { addrDetail, city_value } = this.state;
    return (
      <div className={styles.devAddressPage}>
        <Form>
          <FormCell onClick={() => { this.setState({city_show: true}) }}>
            <CellHeader>行政区域</CellHeader>
            <CellBody>
              {city_value}
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>地址详情</CellHeader>
            <CellBody>
              <Input
                type="text"
                className="myInput"
                placeholder="请输入"
                onChange={this.handleChange}
                value={addrDetail}
              />
              {
                this.state.addrDetail ?
                <img src={cancel_icon} alt="" className={styles.cancel_icon} onClick={this.clearPhone}/>
                : null
              }
            </CellBody>
          </FormCell>
        </Form>
        <div className={styles.btnWraper}>
          <Button onClick={this.handleSubmit}>保存</Button>
        </div>

        <CityPicker
          data={cnData}
          dataMap={{ id: 'name', items: 'sub' }}
          selected={this.state.selected}
          onCancel={e=>this.setState({city_show: false})}
          onChange={this.cityChange}
          show={this.state.city_show}
        />
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceID: state.deviceDetailPage.deviceID,
  deviceDetail: state.deviceDetailPage.deviceDetail,
  userData: state.user.userData,
});
export default connect(mapStateToProps)(DevAddress);

