import React from 'react';
import styles from './index.less';
import moment from 'moment';

import bell from '../../assets/home/gaojing_icon.png';
let fuck = 0;
class Message extends React.PureComponent {
  render() {
    const { message, setPermission } = this.props;
    const { type, time, devShareNoti, strainerAlarm, airQualityNoti } = message;
    let title, content = null;
    if (type === 1) {
      title = '滤网报警提醒';
      let text = '';
      const { strainerStatus } = strainerAlarm;
      strainerStatus.forEach( (item) => {
        if(item.alarm) text += ` ${item.name}`;
      });
      content = (
        <div className={styles.warnNotify}>
          <p><img src={bell} alt="" /><span>{ text }</span></p>
        </div>
      );
    } else if (type === 2) {
      title = '共享设备通知';
      const { deviceID, requestUserID } = devShareNoti;
      content = (
        <div className={styles.shareNotify}>
          <p>{devShareNoti.requestUserName+'的设备'}</p>
          <p>
            <span
              onClick={()=>{
                setPermission(deviceID,requestUserID,3);
              }}
            >允许</span>
            <span
              onClick={()=>{
                setPermission(deviceID,requestUserID,1);
              }}
            >拒绝</span>
            <span
              onClick={()=>{
                setPermission(deviceID,requestUserID,7);
              }}
            >分配主人权限</span>
          </p>
        </div>
      );
    } else if (type === 3) {
      title = '空气污染提醒';
      let sytyleName = 'good';
      if (airQualityNoti.aqLevel === 1) sytyleName = 'worse';
      if (airQualityNoti.aqLevel === 2) sytyleName = 'worser';
      if (airQualityNoti.aqLevel === 3) sytyleName = 'worsest';

      const { paramFlag } = airQualityNoti;
      let value = 0;
      let text = '';
      if ((paramFlag&1) === 1) {
        value = airQualityNoti.ch2o;
        text = '甲醛';
      } else if ((paramFlag&2) === 2) {
        value = airQualityNoti.pm25;
        text = 'PM2.5';
      } else if ((paramFlag&4) === 4) {
        value = airQualityNoti.humidity;
        text = '湿度';
      } else if ((paramFlag&8) === 8) {
        value = airQualityNoti.tvoc;
        text = 'tvoc';
      } else if ((paramFlag&16) === 16) {
        value = airQualityNoti.temp;
        text = '温度';
      } else if ((paramFlag&32) === 32) {
        value = airQualityNoti.co2;
        text = 'co2';
      }
      value = ''+Math.round(value);

      content = (
        <div className={styles.airNotify}>
          <div className={styles[sytyleName]} >
            <p>{value}</p>
            <p>{text}</p>
          </div>
          <p className={styles.airNotice}>{ airQualityNoti.message }</p>
        </div>
      );
    }
    return (
      <div className={styles.message}>
        <p className={styles.title}>{title}</p>
        { content }
        <p className={styles.notifyTime}>{moment.unix(time).format('YYYY-MM-DD  HH:mm:ss')}</p>
      </div>
    );
  }
}

export default Message;