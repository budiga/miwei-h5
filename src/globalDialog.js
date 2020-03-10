import React from 'react';
import { connect } from 'dva';
import { Dialog } from 'react-weui';

class GlobalDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.dialog.show,
      text: props.dialog.text,
      style: {
        buttons: [
          {
            label: '确定',
            onClick: this.hide,
          }
        ]
      },
    };
  }

  hide = () => {
    this.setState({
      show: false,
      text: '',
    });
  }

  componentWillReceiveProps(nextProps) {
    const {show, text} = nextProps.dialog;
    this.setState({
      show,
      text,
    });
  }
  
  render(){
    const {show, text} = this.state;
    return (
      <Dialog
        type="ios"
        buttons={this.state.style.buttons}
        show={show}
      >
       { text }
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  dialog: state.global.dialog,
});
export default connect(mapStateToProps)(GlobalDialog);