import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {Button, ButtonArea, SearchBar, ActionSheet, LoadMore} from 'react-weui';
import Device from '../../components/device';
import { setGlobalToast, canPass } from '../../utils/util.js';
import PullToRefresh from 'rmc-pull-to-refresh';
import 'rmc-pull-to-refresh/assets/index.css';

import icon_scan from '../../assets/home/saomiao.png';
import icon_close from '../../assets/home/close_icon.png';
import device_img from '../../assets/home/pic.png';
import styles from './Devices.less';

class Devices extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      refreshing: false,
      isLoadingMore: false,
    };

    this.lastScrollTop = 0;
  }

  componentDidMount() {
    this.fetchData(1);
  }
  

  fetchData(page, searchValue) { // page为页码
    const { dispatch } = this.props;

    const params = { page };
    if (searchValue) params.deviceName = searchValue;

    dispatch({
      type: 'devices/fetch',
      payload: params,
      callback: () => {
        if (this.state.refreshing){
          this.setState({refreshing:false});
        }
        if (this.state.isLoadingMore){
          this.setState({isLoadingMore:false});
        }
      },
    });
  }

  handleChange = (e) => {
    let value = e.target.value.trim();
    this.setState(() => ({
      searchValue: value,
    }));

    if (!canPass(200)) return;

    this.fetchData(1, value);
  }

  resetSearch = () => {
    this.setState({
      searchValue: '',
    });

    this.fetchData(1);
  }

  toDeviceDetail = (deviceID, isRent, deviceType) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/deviceDetail?deviceID=${deviceID}&isRent=${isRent}&deviceType=${deviceType}`));
  }
  getControlAuth = (deviceID) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'devices/getControlAuth',
      payload: {
        deviceID,
      },
      callback: (resp) => {
        if (resp.errCode === 0) setGlobalToast(true, '申请成功');
      },
    });
  }

  showDeviceList() {
    const { devices } = this.props;

    if (devices.length < 1) return null;

    return devices.map(item => <Device key={item.deviceID} device={item} toDeviceDetail={this.toDeviceDetail} getControlAuth={this.getControlAuth}/>);
  }

  ptrOnScroll = (e) => {
    const {scrollHeight, offsetHeight, scrollTop} = e.currentTarget;
    const trigger = scrollHeight - offsetHeight;

    if (scrollTop > this.lastScrollTop) { // 代表向上拖动页面
      if (scrollTop >= trigger - 10) {
        const { page, hasMore } = this.props;
        if(!hasMore) return true;

        if (this.state.isLoadingMore) return true;
        this.setState({ isLoadingMore: true });

        this.fetchData(page);
      }
    }
    this.lastScrollTop = scrollTop;
  }

  showFooter() {
    const { isLoadingMore } = this.state;
    const { hasMore } = this.props;

    if (isLoadingMore) return <LoadMore loading>加载中...</LoadMore>;
    else if (hasMore) return <LoadMore showLine>上拉加载</LoadMore>;
    else return <LoadMore showLine>加载完毕</LoadMore>;
  }

  render() {
    const { clickScan } = this.props;
    return (
      <div className={styles.devicesPage}>
        <div className={styles.searchScan}>
          <input
            placeholder="搜索"
            value={this.state.searchValue}
            className={styles.search}
            onChange={this.handleChange}
          />
          {
            this.state.searchValue ?
            <img
              src={icon_close}
              className={styles.closeIcon}
              onClick={this.resetSearch}
            /> : null
          }
          <img
            src={icon_scan}
            className={styles.scanImg}
            onClick={clickScan}
          />
        </div>
        <PullToRefresh
          indicator={{ activate: '放开刷新', deactivate: '下拉刷新', release: '加载中...', finish: '刷新完成' }}
          refreshing={this.state.refreshing}
          onRefresh={ () => {
            this.setState({refreshing: true});
            this.fetchData(1)
          }}
          onScroll={ this.ptrOnScroll }
        > 
          <div className={styles.devicesList}>
            { this.showDeviceList() }
          </div>
          {
            this.showFooter()
          }
        </PullToRefresh>
        
      </div>
    );
  }
}

const mapStateToProps = state => ({
  devices: state.devices.devices,
  page: state.devices.page,
  hasMore: state.devices.hasMore,
  tabIndex: state.home.tabIndex,
});
export default connect(mapStateToProps)(Devices);
