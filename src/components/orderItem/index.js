import React from 'react';
import styles from './index.less';
import moment from 'moment';

class OrderItem extends React.PureComponent {
  render() {
    const { data } = this.props;
    
    return (
      <div className={styles.orderItem}>
        <p>
          <span>{data.deviceName}</span>
          <span>{`${data.price/100}元／${data.rentTime/60}小时`}</span>
        </p>
        <p>
          <span>{moment.unix(data.payTime).format('YYYY-MM-DD')}</span>
          <span>{moment.unix(data.payTime).format('HH:mm:ss')}</span>
        </p>
      </div>
    );
  }
}

export default OrderItem;

