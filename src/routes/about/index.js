import React from 'react';

import styles from './index.less';
import logo_png from '../../assets/login/logo.png';

class About extends React.Component {
  componentDidMount(){
    document.title = '关于米微';
  }
  
  render() {
    return (
      <div className={styles.aboutPage}>
        <p className={styles.logo}><img src={logo_png}/></p>
        <p>微信 1.0.0</p>
        <div className={styles.desc}>
          <p>固件详情</p>
          <p>1、解决了一些bug</p>
          <p>2、新增一些功能</p>
        </div>
      </div>
    );
  }
};

export default About;