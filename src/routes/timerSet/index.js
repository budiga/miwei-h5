import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Switch,
} from 'react-weui';

import { genRepeText, setGlobalToast } from '../../utils/util';
import { SPEEDS, WIND_MODES} from '../../utils/constant';
import styles from './index.less';
import tianjia_icon from '../../assets/tianjia_icon.png';
import guanbi_icon from '../../assets/guanbi_icon.png';

class TimerSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    document.title = '定时设置';

    this.fetchData();
  }

  fetchData(){
    const { dispatch, deviceID } = this.props;
    dispatch({
      type: 'deviceDetailPage/fetchTimers',
      payload: {deviceID},
    });
  }

  mainSwitchChange = (e) => {
    const { dispatch, deviceID } = this.props;
    const checked = e.target.checked;

    dispatch({
      type: 'deviceDetailPage/switchAll',
      payload: {
        deviceID,
        enable: checked,
      },
    });
  }
  timerSwitchChange = (timerID, enable) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/editTimer',
      payload: {
        id: timerID,
        enable,
      },
    });
  }

  clickEditBtn = () => {
    const { dispatch, timersEditing } = this.props;
    dispatch({
      type: 'deviceDetailPage/setTimersEditing',
      payload: !timersEditing,
    });
  }
  toAddTimer = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        startTime: 0,
        repetition: 0,
        airSpeed: 3,
        auxiliaryHeat: false,
        ventilationMode: 0,
        powerOn: false,
        editingRepe: {
          repes: [],
          repeValue: 0,
        },
      },
    });
    dispatch(routerRedux.push('/timerSet/edit'));
  }
  toEditTimer = (timerID) => {
    const { dispatch, timersData, timersEditing } = this.props;
    if (!timersEditing) return;

    const { timers } = timersData;
    const timer = timers.filter(item => item.id === timerID)[0];
    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: { ...timer },
    });

    dispatch(routerRedux.push('/timerSet/edit'));
  }
  deleteTimer = (timerID) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deviceDetailPage/deleteTimer',
      payload: {id: timerID},
    });
  }


  minToHour(rang){
    let hour = Math.floor(rang/60);
    let mins = rang - hour * 60;
    if (hour < 10) hour = '0' + hour;
    if (mins < 10) mins = '0' + mins;

    return `${hour}:${mins}`;
  }
  generateTimers(timers) {
    if (timers.length < 1) return null;

    const { dispatch, timersData, timersEditing } = this.props;
    const { enable } = timersData;

    return timers.map((timer) => {
      return (
        <Cell
          key={timer.id}
          access={timersEditing ? true : false}
          onClick={() => { this.toEditTimer(timer.id) }}
        >
          {
            timersEditing ?
            <CellHeader>
              <img src={guanbi_icon} alt="" className={styles.guanbi_icon}
              onClick={(e) => {
                e.stopPropagation();
                this.deleteTimer(timer.id);
              }}/>
            </CellHeader>
            : null
          }
          <CellBody>
            <p
              className={(enable && timer.enable) ? styles.timerDesc_on : styles.timerDesc}
            >
              <span>{this.minToHour(timer.startTime)}</span>
              {`(${genRepeText(timer.repetition)})`}
              <br />
              {this.geneDescText(timer)}
            </p>
          </CellBody>
          <CellFooter>
            {
              timersEditing ?
              null :
              <Switch
                className={enable ? '' : 'timer_switch_off'}
                disabled={!enable}
                checked={timer.enable}
                onChange={(e) => { this.timerSwitchChange(timer.id, e.target.checked) }}
              />
            }
          </CellFooter>
        </Cell>
      );
    });
  }

  geneDescText(timer){
    const { powerOn, auxiliaryHeat, airSpeed, ventilationMode } = timer;
    let text = '';
    if (powerOn) text += '开机';
    else text += '关机';

    text += ' ' + SPEEDS[airSpeed].label;
    
    if (auxiliaryHeat) text += ' 辅热开';
    else text += ' 辅热关';
    
    text += ' ' + WIND_MODES[ventilationMode].label;
    return text;
  }

  render() {
    const { deviceID, timersData, dispatch, timersEditing } = this.props;    
    const { timers, enable } = timersData;
    return (
      <div className={styles.timingSetPage}>
        <p className={styles.edit_btns}>
          <span onClick={this.clickEditBtn}>{timersEditing ? '完成' : '编辑'}</span>
          <img src={tianjia_icon} alt="" onClick={this.toAddTimer}/>
        </p>

        <Cells>
          <Cell>
            <CellBody>总开关</CellBody>
            <CellFooter>
              <Switch checked={enable} onChange={this.mainSwitchChange}/>
            </CellFooter>
          </Cell>
          {
            this.generateTimers(timers)
          }
        </Cells>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceID: state.deviceDetailPage.deviceID,
  timersData: state.deviceDetailPage.timersData,
  timersEditing: state.deviceDetailPage.timersEditing,
});
export default connect(mapStateToProps)(TimerSet);

