import React from 'react';
import { connect } from 'dva';
import { LoadMore } from 'react-weui';
import PullToRefresh from 'rmc-pull-to-refresh';
import 'rmc-pull-to-refresh/assets/index.css';

import styles from './index.less';
import OrderItem from '../../components/orderItem';

class OrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      isLoadingMore: false,
    };
  }

  componentDidMount() {
    document.title = '订单中心';

    this.fetchOrderList(1);
  }

  fetchOrderList(page) {
    const { dispatch } = this.props;

    dispatch({
      type: 'orderList/fetchOrderList',
      payload: {
        page,
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

  showFooter() {
    const { isLoadingMore } = this.state;
    const { hasMore, orderList } = this.props;

    if (isLoadingMore) return <LoadMore loading>加载中...</LoadMore>;
    else if (hasMore) return <LoadMore showLine>上拉加载</LoadMore>;
    else if (orderList.length === 0) return <LoadMore showLine>暂无数据</LoadMore>;
    else return <LoadMore showLine>加载完毕</LoadMore>;
  }
  
  ptrOnScroll = (e) => {
    const {scrollHeight, offsetHeight, scrollTop} = e.currentTarget;
    const trigger = scrollHeight - offsetHeight;

    if (scrollTop > this.lastScrollTop) { // 代表向上拖动页面
      if (scrollTop >= trigger - 20) {
        const { hasMore, page } = this.props;
        if(!hasMore) return;

        if (this.state.isLoadingMore) return;
        this.setState({ isLoadingMore: true });

        this.fetchOrderList(page);
      }
    }
    this.lastScrollTop = scrollTop;
  }

  geneList(orderList) {
    if (orderList.length < 1) return null;

    return orderList.map(item => <OrderItem key={item.payTime} data={item} />);
  }

  render() {
    const { orderList } = this.props;
    
    return (
      <PullToRefresh
        className={styles.orderListPage}
        indicator={{ activate: '放开刷新', deactivate: '下拉刷新', release: '加载中...', finish: '刷新完成' }}
        refreshing={this.state.refreshing}
        onRefresh={ () => { 
          this.setState({refreshing: true});
          this.fetchOrderList(1)
        }}
        onScroll={ this.ptrOnScroll }
      >
        {this.geneList(orderList)}
        {
          this.showFooter()
        }
      </PullToRefresh>
    );
  }
};

const mapStateToProps = state => ({
  orderList: state.orderList.orderList,
  page: state.orderList.page,
  hasMore: state.orderList.hasMore,
});
export default connect(mapStateToProps)(OrderList);

