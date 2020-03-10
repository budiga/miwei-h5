import React from 'react';
import { secToHour } from '../../utils/util';


class TimeCut extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      time: props.remainTime,
    };
  }

  componentDidMount() {
    this.timeId = setInterval(this.tick, 1000);
  }
  componentWillUnmount() {
    if (this.timeId) clearInterval(this.timeId);
  }
  componentWillReceiveProps(nextProps) {
    if(this.timeId) clearInterval(this.timeId);
    this.setState({
      time: nextProps.remainTime
    });
    this.timeId = setInterval(this.tick, 1000);
  }

  tick = () => {
    this.setState((pre) => {
      if (pre.time <= 0) {
        return { time: 0 };
        clearInterval(this.timeId);
      }
      let time = pre.time - 1;
      return { time };
    })
  }

  render() {
    const { overText, defColor, overColor } = this.props;
    const { time } = this.state;
    return (
      <span style={{fontSize:'0.28rem',color:time===0?(overColor||'#fff'):(defColor||'#fff')}}>
        {time === 0 && overText ? overText : secToHour(time)}
      </span>
    );
  }
}

export default TimeCut;


