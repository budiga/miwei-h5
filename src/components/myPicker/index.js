import React from 'react';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import Picker from 'rmc-picker/lib/Picker';
import 'rmc-picker/assets/index.css';

import styles from './index.less';

const getNumStr = (max) => {
  const arr = [];
  for(let i = 0; i <= max; i++) {
    let ele = i < 10 ? `0${i}` : `${i}`;
    arr.push(ele);
  }
  return arr;
}

const hourItems = getNumStr(23).map((num) => {
  return (<Picker.Item key={num} className={styles.my_picker_item} value={num}>{num}</Picker.Item>);
});
const minItems = getNumStr(59).map((num) => {
  return (<Picker.Item  key={num} className={styles.my_picker_item} value={num}>{num}</Picker.Item>);
});

class MyPicker extends React.PureComponent {

  render() {
    const { timeValue, handleTimeChange } = this.props;
    return (
      <div className={styles.minePicker}>
        <MultiPicker
          selectedValue={timeValue}
          onValueChange={handleTimeChange}
        >
          <Picker indicatorClassName={styles.my_picker_indicator}>
            { hourItems }
          </Picker>
          <Picker indicatorClassName={styles.my_picker_indicator}>
            { minItems }
          </Picker>
        </MultiPicker>
      </div>
    );
  }
}

export default MyPicker;
