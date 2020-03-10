import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import _ from 'lodash';
import moment from 'moment';

import styles from './index.less';

const commonOption = {
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    show: false,
    left: '4%',
    right: '5%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLine: {
      lineStyle:{
        color: {
          type: 'linear',
          x: 0,
          y: 0.5,
          x2: 1,
          y2: 0.5,
          colorStops: [{
              offset: 0, color: 'rgba(172,205,202,0.3)' // 0% 处的颜色
          }, {
              offset: 0.5, color: 'rgba(172,205,202,1)' // 100% 处的颜色
          }, {
              offset: 1, color: 'rgba(172,205,202,0.3)' // 100% 处的颜色
          }],
        },
      },
    },
    axisTick: {
      show: false,
      interval: 0,
    },
    axisLabel: {
      interval: 0,
      margin: 12,
      color: '#23938b',
      fontSize: 10,
      fontWeight: 'bold',
      rotate: 30,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: {
          type: 'linear',
          x: 0.5,
          y: 0,
          x2: 0.5,
          y2: 1,
          colorStops: [{
              offset: 0, color: 'rgba(233,241,241,0.3)' // 0% 处的颜色
          }, {
              offset: 0.5, color: 'rgba(233,241,241,1)' // 100% 处的颜色
          }, {
              offset: 1, color: 'rgba(233,241,241,0.3)' // 100% 处的颜色
          }],
        },
      },
    },
    axisPointer: {
      type:'line',
      lineStyle: {
        color: 'rgba(172,205,202,1)',
      },
    },
    data: ['暂无数据']
  },
  yAxis: {
    name: '数量',
    type: 'value',
    offset: 10,
    splitNumber: 4,
    axisLine: {
      show: false,
    },
    splitLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#23938b',
      fontSize: 10,
      fontWeight: 'bold',
    },
  },
  dataZoom: [{
    id: 'dataZoomX',
    type: 'slider',
    xAxisIndex: [0],
    filterMode: 'filter', // 设定为 'filter' 从而 X 的窗口变化会影响 Y 的范围。
    start: 30,
    end: 70,
  }],
};
const lineSeries = [
  {
    name: '',
    type: 'line',
    symbol: 'circle',
    symbolSize: 2,
    smooth: true,
    itemStyle: {
      normal: {
        color: '#b574fd',
        lineStyle: {
          width: 2, // 折线宽度
        },
      },
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0.5,
        y: 0,
        x2: 0.5,
        y2: 1,
        colorStops: [{
            offset: 0, color: 'rgba(181,116,253,1)' // 0% 处的颜色
        }, {
            offset: 1, color: 'rgba(181,116,253,0.3)' // 100% 处的颜色
        }],
      },
    },
    data: [0],
  },
];
const barSeries = [
  {
    name: '',
    type: 'bar',
    barWidth: '40%',
    itemStyle: {
      color: '#23938b',
    },
    data: [0],
  },
];
const lineOption = _.cloneDeep(commonOption);
lineOption.series = lineSeries;

const barOption = _.cloneDeep(commonOption);
barOption.series = barSeries;
barOption.xAxis.axisPointer = { type: 'shadow' };

class MyChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dateType: 0,
    };
  }

  setDateType = (type) => {
    this.setState({ dateType: type });
    this.props.setDateType(type);
  }

  processSttsData(dataSource) {
    const { type } = this.props;
    if (!dataSource || !Array.isArray(dataSource)) {
      if (type === 'line') return lineOption;
      else return barOption;
    }

    const len = dataSource.length;
    let newOptions = null;
    if (type === 'line') {
      if (len < 1) return lineOption;
      // newOptions = lineOption; 
      newOptions = _.cloneDeep(lineOption); // 必须深复制一份
    } else {
      if (len < 1) return barOption;
      newOptions = _.cloneDeep(barOption);
    }

    if (len > 8) {
      newOptions.xAxis.axisLabel.interval = 1;
    }
    if (len > 15) {
      newOptions.xAxis.axisLabel.interval = 2;
    }
    if (len > 24) {
      newOptions.xAxis.axisLabel.interval = 3;
    }
    const { dateType } = this.state;
    newOptions.series[0].data = dataSource.map(item => item.value);
    newOptions.xAxis.data = this.generateXLabels(dataSource,dateType);

    return newOptions;
  }
  generateXLabels(list, type) {
    if (type === 0) {
      return list.map(item => `${moment.unix(item.time).format('HH:mm')}`);
    } else if (type === 3 || type === 1){
      return list.map(item => `${moment.unix(item.time).format('MM-DD')}`);
    } else if (type === 2){
      return list.map(item => `${moment.unix(item.time).format('YYYY-MM')}`);
    }
  }

  render() {
    const { title, type, dataSource } = this.props;
    const { dateType } = this.state;
    const newOptions = this.processSttsData(dataSource);

    return (
      <div className={styles.chartWrapper} >
        <p className={styles.chartTitle}>{title}</p>
        <div className={styles.timeRange}>
          <span
            onClick={() => { this.setDateType(0)} }
            className={ dateType === 0 ? styles.active : null}
          >日</span>
          <span
            onClick={() => { this.setDateType(3)} }
            className={ dateType === 3 ? styles.active : null}
          >周</span>
          <span
            onClick={() => { this.setDateType(1)} }
            className={ dateType === 1 ? styles.active : null}
          >月</span>
          <span
            onClick={() => { this.setDateType(2)} }
            className={ dateType === 2 ? styles.active : null}
          >年</span>
        </div>

        <ReactEchartsCore
          echarts={echarts}
          notMerge
          lazyUpdate
          onChartReady={(echarts) => {}}
          ref={(e) => { this.chart_obj = e; }}
          style={{ height: 300 }}
          option={newOptions}
        />
      </div>
    );
  }
}
// 0：按小时统计，日曲线（最多24个点）1：按天统计，月曲线（最多31个点）2：按月统计，年曲线（最多12个点）3：按天统计，周曲线（最多7个点）

export default MyChart;
