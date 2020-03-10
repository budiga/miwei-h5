import React from 'react';
import { connect } from 'dva';
import { Toast } from 'react-weui';

class GlobalLoading extends React.Component {
  render(){
    const { loading } = this.props;
    return <Toast icon="loading" show={loading} />;
  }
}

const mapStateToProps = state => ({
  loading: state.global.loading,
});
export default connect(mapStateToProps)(GlobalLoading);