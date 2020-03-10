import React from 'react';
import styles from './index.less';

class PmIndicator extends React.PureComponent {
  render() {
    let { deviceData } = this.props;

    let pm25 = '0', outdoorPM25 = '0';
    if (deviceData) {
      if (deviceData.pm25) pm25 = '' + deviceData.pm25;
      if (deviceData.outdoorPM25) outdoorPM25 = '' + deviceData.outdoorPM25;
    }

    let isOutLonger = true;
    if (pm25.length > outdoorPM25.length) isOutLonger = false;

    return (
      <div className={styles.indicator} >
        <p>
          <span style={{borderBottom: isOutLonger?'unset':'1px solid #fff'}}>
            {pm25}
            <span className={styles.firstLineText}>室内</span>
            <span className={styles.secondLine} style={{borderTop: isOutLonger?'1px solid #fff':'unset'}}>
              {outdoorPM25}<span>室外</span>
            </span>
          </span>
        </p>
        <p><span>pm2.5</span></p>
      </div>
    );
  }
}

export default PmIndicator;
