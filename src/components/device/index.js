import React from 'react';
import styles from './index.less';
import { IMG_COMMON_URL } from '../../utils/constant';
import TimeCut from '../timeCut';

class Device extends React.PureComponent {
  render() {
    const { device, toDeviceDetail, getControlAuth } = this.props;
    const { deviceID, modelInfo, rentInfo, prodInfo, online, permission } = device;

    const isRent = (prodInfo.id === 0 && modelInfo.connWay === 1);
    const text = isRent ? '租赁设备' : (online ? '在线' : '离线');
    return (
      <div className={styles.device} onClick={() => {toDeviceDetail(deviceID, isRent, prodInfo.id)}}>
        <img src={IMG_COMMON_URL + modelInfo.imageID}/>
        <p className={styles.owner}>{ device.deviceName }</p>
        <p className={styles.status}>{ text }</p>
        {
          isRent ?
          ( rentInfo ?
            <p className={styles.time}>
              
              <TimeCut
                remainTime={rentInfo.rentRemainingTime?rentInfo.rentRemainingTime:0}
                overText="已结束"
                defColor="#ff315d"
                overColor="#c8c8c8"
              />
              <span>{`${rentInfo.price/100}元/${rentInfo.rentTime/60}小时`}</span>
            </p> :
            <p className={styles.time}>
              <span className={styles.grayText}>已结束</span>
              <span>0.00元/0小时</span>
            </p>
          )
          :
          <p className={styles.control}>
            {
              permission !== 7 ?
              <span onClick={(e) => {
                e.stopPropagation();
                getControlAuth(deviceID);
              }}>申请权限控制</span>
              :
              <span className={styles.grayText}>已有权限</span>
            }
          </p>
        }
      </div>
    );
  }
}

export default Device;
