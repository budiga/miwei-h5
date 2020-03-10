import React from 'react';
import { connect } from 'dva';
import { LoadMore } from 'react-weui';
// import { canPass } from '../../utils/util.js';
import PullToRefresh from 'rmc-pull-to-refresh';
import 'rmc-pull-to-refresh/assets/index.css';

import Message from '../../components/message';
import styles from './Messages.less';
import { setGlobalToast } from '../../utils/util';

class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      isLoadingMore: false,
    };
  }

  componentDidMount() {
    this.fetchData(false);
  }

  fetchData(loadMore) {
    const { dispatch } = this.props;

    dispatch({
      type: 'messages/fetch',
      payload: {
        loadMore,
      },
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

  setPermission = (deviceID, userID, permission) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'messages/setPermission',
      payload: {deviceID, userID, permission},
      callback: (resp) => {
        if (resp.errCode === 0) { setGlobalToast(true, '设置成功') }
      }
    });
  }
  showMsgList() {
    const { msgList } = this.props;

    if (msgList.length < 1) return null;

    return msgList.map(item => <Message key={''+item.id+item.time} message={item} setPermission={this.setPermission}/>);
  }
  showFooter() {
    const { isLoadingMore } = this.state;
    const { hasMore, msgList } = this.props;

    if (isLoadingMore) return <LoadMore loading>加载中...</LoadMore>;
    else if (hasMore) return <LoadMore showLine>上拉加载</LoadMore>;
    else if (msgList.length === 0) return <LoadMore showLine>设备运行良好，暂无消息</LoadMore>;
    else return <LoadMore showLine>加载完毕</LoadMore>;
  }
  
  ptrOnScroll = (e) => {
    const {scrollHeight, offsetHeight, scrollTop} = e.currentTarget;
    const trigger = scrollHeight - offsetHeight;

    if (scrollTop > this.lastScrollTop) { // 代表向上拖动页面
      if (scrollTop >= trigger - 20) {
        const { hasMore } = this.props;
        if(!hasMore) return;

        if (this.state.isLoadingMore) return;
        this.setState({ isLoadingMore: true });

        this.fetchData(true);
      }
    }
    this.lastScrollTop = scrollTop;
  }

  render() {
    return (
      <PullToRefresh
        className={styles.messagesPage}
        indicator={{ activate: '放开刷新', deactivate: '下拉刷新', release: '加载中...', finish: '刷新完成' }}
        refreshing={this.state.refreshing}
        onRefresh={ () => { 
          this.setState({refreshing: true});
          this.fetchData(false)
        }}
        onScroll={ this.ptrOnScroll }
      >
        {this.showMsgList()}
        {
          this.showFooter()
        }
      </PullToRefresh>
    );
  }
};

const mapStateToProps = state => ({
  msgList: state.messages.msgList,
  hasMore: state.messages.hasMore,
});
export default connect(mapStateToProps)(Messages);