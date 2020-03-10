import React from 'react';
import styles from './index.less';
import { ActionSheet } from 'react-weui';
import { setGlobalToast } from '../../utils/util.js';

const ventilationModes = [
  {
    id: 0,
    label: '低效',
  },
  {
    id: 1,
    label: '关闭',
  },
  {
    id: 2,
    label: '高效',
  },
];
const airSpeeds = [
  {
    id: 0,
    label: '自动',
  },
  {
    id: 1,
    label: '静音',
  },
  {
    id: 2,
    label: '舒适',
  },
  {
    id: 3,
    label: '标准',
  },
  {
    id: 4,
    label: '强力',
  },
  {
    id: 5,
    label: '飓风',
  },
];
class OnOff extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      menus: [],
      actions: [
        {
          label: '取消',
          onClick: (e) => { this.setState({show: false}) },
        },
      ],
    };
  }
  
  windClick = () => {
    const { clickCb, isTestDev, permission, deviceStatus, isSetting } = this.props;
    if (isSetting) {
      setGlobalToast(true, '控制忙，请稍后');
      return;
    }
    if (isTestDev) {
      setGlobalToast(true, '检测仪无法设置此项');
      return;
    }
    if (permission < 3) {
      setGlobalToast(true, '无设置权限');
      return;
    }
    if (!deviceStatus.powerOn) {
      setGlobalToast(true, '设备关机，无法设置');
      return;
    }

    const menus = ventilationModes.map(item => {
      return {
        label: item.label,
        onClick: () => {
          this.setState({show: false});
          clickCb('wind', item.id);
        },
      };
    });

    this.setState({ show: true, menus });
  }
  speedClick = () => {
    const { clickCb, isTestDev, permission, deviceStatus, isSetting } = this.props;
    if (isTestDev) {
      setGlobalToast(true, '检测仪无法设置此项');
      return;
    }
    if (permission < 3) {
      setGlobalToast(true, '无设置权限');
      return;
    }
    if (!deviceStatus.powerOn) {
      setGlobalToast(true, '设备关机，无法设置');
      return;
    }
    if (isSetting) {
      setGlobalToast(true, '控制忙，请稍后');
      return;
    }

    const menus = airSpeeds.map(item => {
      return {
        label: item.label,
        onClick: () => {
          this.setState({show: false});
          clickCb('speed', item.id);
        },
      };
    });

    this.setState({ show: true, menus });
  }

  render() {
    const { deviceStatus, clickCb, isTestDev, permission } = this.props;
    const { online, powerOn, ventilationMode, auxiliaryHeat, airSpeed, fanTiming} = deviceStatus;

    const windMode = ventilationModes.filter(item => item.id === ventilationMode)[0];
    const windModeText = windMode ? windMode.label : '低效';

    const speed = airSpeeds.filter(item => item.id === airSpeed)[0];
    const speedText = speed ? speed.label : '自动';


    let cl1, cl2, cl3, cl4, cl5;
    cl1 = cl2 = cl3 = cl4 = cl5 = 'highLight';
    if (!online) {
      cl1 = cl2 = cl3 = cl4 = cl5 = 'normal';
    } else if (!powerOn) {
      cl2 = cl3 = cl4 = 'normal';
    }
    if (isTestDev) cl2 = cl3 = cl4 = cl5 = 'normal';
    if (permission < 3) cl1 = cl2 = cl3 = cl4 = cl5 = 'normal';

    return (
      <div className={styles.onOff} >
        <div className={styles.box}>
          <div onClick={()=>{ clickCb('onoff')}}>
            <div className={styles[cl1]}>{powerOn ? '开' : '关'}</div>
            <p>开关</p>
          </div>

          <div onClick={this.windClick}>
            <div className={styles[cl2]}>{windModeText}</div>
            <p>新风</p>
          </div>

          <div onClick={()=>{ clickCb('heat')}}>
            <div className={styles[cl3]}>{auxiliaryHeat ? '开' : '关'}</div>
            <p>辅热</p>
          </div>
        </div>
        <div className={styles.box}>
          <div onClick={this.speedClick}>
            <div className={styles[cl4]}>{speedText}</div>
            <p>风速</p>
          </div>

          <div onClick={()=>{ clickCb('time')}}>
            <div className={styles[cl5]}>{fanTiming ? '开' : '关'}</div>
            <p>定时</p>
          </div>

          <div onClick={()=>{ clickCb('set')}}>
            <div className={styles.highLight}>设置</div>
            <p>设置</p>
          </div>
        </div>

        <ActionSheet
          type="ios"
          menus={this.state.menus}
          actions={this.state.actions}
          show={this.state.show}
          onRequestClose={e=>this.setState({show:false})}
        />
      </div>
    );
  }
}

export default OnOff;
