import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from 'react-weui';

import { DAYS } from '../../utils/constant';
import duihao_icon from '../../assets/duihao_icon.png';


class PickDays extends React.Component {
  componentDidMount(){
    document.title = '重复';
  }
  
  pickDay = (value) => {
    const { dispatch, repetition} = this.props;
    let newRepetition = repetition;

    if ((repetition & value) === value) {
      newRepetition -= value;
    } else {
      newRepetition += value;
    }

    dispatch({
      type: 'deviceDetailPage/saveEditingTimer',
      payload: {
        repetition: newRepetition,
      },
    });
  }

  render() {
    const { dispatch, repetition } = this.props;
    const cells = DAYS.map((item) => {
      let key = item.key;
      return (
        <Cell onClick={()=>{this.pickDay(item.value)}} key={key}>
          <CellBody>{item.label}</CellBody>
          <CellFooter>
          {
            (repetition&item.value) ?
            <img src={duihao_icon} alt="" style={{width:'20px'}} /> : null
          }
          </CellFooter>
        </Cell>
      );
    });

    return (
      <Cells>
        { cells }
      </Cells>
    );
  }
};

const mapStateToProps = state => ({
  repetition: state.deviceDetailPage.editingTimer.repetition,
});
export default connect(mapStateToProps)(PickDays);