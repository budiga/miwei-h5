import React from 'react';
import { connect } from 'dva';
import {
  Cells,
  Cell,
  CellBody,
  CellFooter,
  Switch,
  Icon,
} from 'react-weui';

import styles from './index.less';

//本组件的数据都放在state里了，未放在redux里
class MatchDevice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enable: false,
      devices: [], // 可以匹配的设备
      matchDeviceID: '',
      matchDeviceName: '',
      linkControl: false,
    };
  }

  componentDidMount() {
    document.title = '绑定设备';

    this.fetchMatchDevices();
  }

  fetchMatchDevices() {
    const { dispatch, deviceID } = this.props;

    dispatch({
      type: 'deviceDetailPage/fetchMatchDevices',
      payload: {deviceID},
      callback: this.saveDevices,
    });
  }
  saveDevices = (resp) => {
    if (resp.errCode === 0) {
      const { detectors, matchDeviceID, matchDeviceName, linkControl } = resp.data;
      if (matchDeviceID) {
        this.setState({
          enable: true,
          devices: detectors,
          matchDeviceID,
          matchDeviceName,
          linkControl,
        });
      } else {
        this.setState({
          devices: detectors,
        });
      }
    }
  }

  addMatchDevice = (device) => {
    const { matchDeviceID, linkControl } = this.state;
    if(device.deviceID === matchDeviceID) return;

    const { dispatch, deviceID } =this.props;
    dispatch({
      type: 'deviceDetailPage/setMatchDeviceInfo',
      payload: {
        deviceID,
        matchDeviceID: device.deviceID,
        linkControl,
      },
      callback: (resp) => {
        if (resp.errCode === 0) {
          this.setState({
            matchDeviceID: device.deviceID,
            matchDeviceName: device.deviceName,
          });
        }
      }
    });
  }
  setEnable = (e) => {
    const checked = e.target.checked;

    const { matchDeviceID } = this.state;
    const { dispatch, deviceID } = this.props;
    if (checked) {
      this.setState({ enable: checked });
    } else {
      if (matchDeviceID) { // 关闭开关时，如已有关联设备则是删除操作
        dispatch({
          type: 'deviceDetailPage/setMatchDeviceInfo',
          payload: {deviceID},
          callback: (resp) => {
            if (resp.errCode === 0) {
              this.setState({
                matchDeviceID: '',
                matchDeviceName: '',
                linkControl: false,
                enable: checked,
              });
            }
          }
        });
      } else {
        this.setState({ enable: checked });
      }
    }
  }
  autoMatch = (e) => {
    const checked = e.target.checked;

    const { matchDeviceID } = this.state;
    const { dispatch, deviceID } = this.props;

    if (matchDeviceID) {
      dispatch({
        type: 'deviceDetailPage/setMatchDeviceInfo',
        payload: {
          deviceID,
          matchDeviceID,
          linkControl: checked,
        },
        callback: (resp) => {
          if (resp.errCode === 0) {
            this.setState({
              linkControl: checked,
            });
          }
        }
      });
    } else {
      this.setState({ linkControl:checked });
    }
  }

  render() {
    const { enable, devices, matchDeviceID, matchDeviceName, linkControl } = this.state;

    const list = devices.map((item) => {
      return (
        <Cell 
          onClick={() => { this.addMatchDevice(item) }}
          key={item.deviceID}
        >
          <CellBody>{item.deviceName}</CellBody>
          <CellFooter>
            点击选取
          </CellFooter>
        </Cell>
      );
    });

    return (
      <div className={styles.matchDevicePage}>
        <Cells>
          <Cell>
            <CellBody>关联设备</CellBody>
            <CellFooter>
              <Switch
                checked={enable}
                onChange={this.setEnable}
              />
            </CellFooter>
          </Cell>
          {
            matchDeviceID ?
            <Cell>
              <CellBody>{matchDeviceName}</CellBody>
              <CellFooter>
                <Icon value="success-no-circle"/>
              </CellFooter>
            </Cell> : null
          }
        </Cells>
        {
          enable ?
          (
            list.length > 0 ?
            <div>
              <p className={styles.title}>选取设备</p>
              <Cells>
                { list }
              </Cells>
              <Cells>
                <Cell>
                  <CellBody>自动关联</CellBody>
                  <CellFooter>
                    <Switch
                      checked={linkControl}
                      onChange={this.autoMatch}
                    />
                  </CellFooter>
                </Cell>
              </Cells>
            </div> :
            <div>
              <p className={styles.title}>选取设备</p>
              <p className={styles.noDevices}>无可连接设备</p>
            </div>
          )
          : null
        }
      </div>
    );
  }
};

const mapStateToProps = state => ({
  deviceID: state.deviceDetailPage.deviceID,
});
export default connect(mapStateToProps)(MatchDevice);

