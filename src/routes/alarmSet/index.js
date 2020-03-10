import React from 'react';
import { connect } from 'dva';
import {
  Cells,
  Cell,
  CellBody,
  CellFooter,
  Switch,
} from 'react-weui';

import styles from './index.less';

class AlarmSet extends React.Component {
  componentDidMount() {
    document.title = '报警管理';

    const { dispatch } = this.props;
    dispatch({
      type: 'alarmSet/fetchAlarms',
    });
  }

  geneList(list) {
    if (list.length < 1) return null;
    return list.map((item) => {
      return (
        <Cells key={item.deviceID}>
          <Cell>
            <CellBody>{item.deviceName}</CellBody>
            <CellFooter>
              <Switch
                checked={item.alarmEnable}
                onChange={(e)=>{this.changeAlarm(item.deviceID, e.target.checked)}}
              />
            </CellFooter>
          </Cell>
        </Cells>
      );
    });
  }

  changeAlarm = (deviceID, checked) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alarmSet/setAlarm',
      payload: [{
        deviceID,
        alarmEnable: checked
      }],
    });
  }

  render() {
    const { alarmSetList } = this.props;
    return (
      <div className={styles.alarmSetPage}>
        {this.geneList(alarmSetList)}
      </div>
    );
  }
};

const mapStateToProps = state => ({
  alarmSetList: state.alarmSet,
});
export default connect(mapStateToProps)(AlarmSet);

