import React from 'react';
import { connect } from 'dva';
import { Toast } from 'react-weui';

class GlobalToast extends React.Component {
  render(){
    const {show, text} = this.props.toast;
    return <Toast className="my-weui-toast" show={show}>{text}</Toast>;
  }
}

const mapStateToProps = state => ({
  toast: state.global.toast,
});
export default connect(mapStateToProps)(GlobalToast);