import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Cells,
  Cell,
  CellBody,
  CellFooter,
  Switch,
  Picker,
} from 'react-weui';

import { genRepeText, setGlobalToast } from '../../utils/util';
import { SPEEDS, WIND_MODES} from '../../utils/constant';
import MyPicker from '../../components/myPicker';
import styles from './EditTimer.less';

const speedGroup = [
  {
    items: SPEEDS,
  }
];
const windGroup = [
  {
    items: WIND_MODES,
  }
];

class EditTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      speed_picker_show: false,
      wind_picker_show: false,
    };
  }

  componentDidMount(){
    document.title = '编辑定时';
  }

  hourToMin(times){
    const hour = parseInt(times[0]);
    console.log(hour * 60 + parseInt(times[1]));
    return hour * 60 + parseInt(times[1]);
  }
  minToHour(rang){
    let hour = Math.floor(rang/60);
    let mins = rang - hour * 60;
    if (hour < 10) hour = '0' + hour;
    else hour = '' + hour;
    if (mins < 10) mins = '0' + mins;
    else mins = '' + mins;
    return [hour,mins];
  }

  cancelEditing = () => {
    this.props.dispatch(routerRedux.goBack());
  }
  
  saveTimer = () => {
    const { dispatch, editingTimer, deviceID } = this.props;
    const { id, repetition, startTime, airSpeed, auxiliaryHeat, ventilationMode, powerOn }  = editingTimer;
    if (id) {
      dispatch({
        type: 'deviceDetailPage/editTimer',
        payload: {
          id,
          deviceID,
          startTime,
          repetition,
          airSpeed,
          auxiliaryHeat,
          ventilationMode,
          powerOn,
        },
        callback: (resp) => {
          if (resp.errCode === 0) {
            setGlobalToast(true, '编辑成功');
            dispatch(routerRedux.goBack());
          }
        },
      });
    } else {
      dispatch({
        type: 'deviceDetailPage/addTimer',
        payload: {
          deviceID,
          startTime,
          repetition,
          airSpeed,
          auxiliaryHeat,
          ventilationMode,
          powerOn,
          enable: true,
        },
        callback: (resp) => {
          if (resp.errCode === 0) {
            setGlobalToast(true, '添加成功');
            dispatch(routerRedux.goBack());
          }
        },
      });
    }
  }
  handleTimeChange = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        startTime: this.hourToMin(value),
      },
    });
  }
  speedChange = (selected) =>{
    const { dispatch } = this.props;
    this.speedValue = selected[0];

    let value = '';
    selected.forEach( (s, i)=> {
        value = speedGroup[i]['items'][s].label
    });
    this.setState({
      speed_picker_show: false
    });

    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        airSpeed: selected[0],
      },
    });
  }
  heatChange = (e) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        auxiliaryHeat: e.target.checked,
      },
    });
  }
  windChange = (selected) =>{
    const { dispatch } = this.props;
    this.windValue = selected[0];

    let value = '';
    selected.forEach( (s, i)=> {
        value = windGroup[i]['items'][s].label
    });
    this.setState({
      wind_picker_show: false
    });

    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        ventilationMode: selected[0],
      },
    });
  }
  powerOnChange = (e) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        powerOn: e.target.checked,
      },
    });
  }


  render() {
    const { dispatch, editingTimer } = this.props;
    const { repetition, startTime, airSpeed, auxiliaryHeat, ventilationMode, powerOn }  = editingTimer;
    console.log(editingTimer);
    return (
      <div className={styles.editTimerPage}>
        <p className={styles.pageTitle}>
          <span onClick={this.cancelEditing}>取消</span>
          <span onClick={this.saveTimer}>保存</span>
        </p>
        <MyPicker 
          timeValue={this.minToHour(startTime)}
          handleTimeChange={this.handleTimeChange}
        />

        <Cells>
          <Cell access onClick={()=>{ dispatch(routerRedux.push('/timerSet/edit/pickDays')) }}>
            <CellBody>重复</CellBody>
            <CellFooter>{genRepeText(repetition)}</CellFooter>
          </Cell>
          <Cell access onClick={()=>{
            this.selectType = 'speed';
            this.setState({
              speed_picker_show: true,
            });
          }}>
            <CellBody>档位</CellBody>
            <CellFooter>{speedGroup[0].items[airSpeed].label}</CellFooter>
          </Cell>
          <Cell>
            <CellBody>辅热</CellBody>
            <CellFooter>
              <Switch onChange={this.heatChange} checked={auxiliaryHeat}/>
            </CellFooter>
          </Cell>
          <Cell access onClick={()=>{
            this.selectType = 'wind';
            this.setState({
              wind_picker_show: true,
            });
          }}>
            <CellBody>新风</CellBody>
            <CellFooter>{windGroup[0].items[ventilationMode].label}</CellFooter>
          </Cell>
          <Cell>
            <CellBody>开关</CellBody>
            <CellFooter>
              <Switch onChange={this.powerOnChange} checked={powerOn}/>
            </CellFooter>
          </Cell>
        </Cells>

        <Picker
          onChange={this.speedChange}
          lang={{ leftBtn: '取消', rightBtn: '确定' }}
          groups={speedGroup}
          show={this.state.speed_picker_show}
          onCancel={e=>this.setState({speed_picker_show: false})}
        />
        <Picker
          onChange={this.windChange}
          lang={{ leftBtn: '取消', rightBtn: '确定' }}
          groups={windGroup}
          show={this.state.wind_picker_show}
          onCancel={e=>this.setState({wind_picker_show: false})}
        />
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceID: state.deviceDetailPage.deviceID,
  editingTimer: state.deviceDetailPage.editingTimer,
});
export default connect(mapStateToProps)(EditTimer);