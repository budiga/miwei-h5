import React from 'react';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';

import styles from './index.less';

const Handle = Slider.Handle;
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={`${value}%`}
      visible={true}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

class MySlider extends React.PureComponent {
  render() {
    const { data, color, callback } = this.props;
    
    return (
      <Slider
        min={0}
        max={100}
        defaultValue={32}
        handle={handle}
        railStyle={{backgroundColor:'#c7c7c7'}}
        trackStyle={{backgroundColor:color}}
        onChange={callback}
      />
    );
  }
}

export default MySlider;

