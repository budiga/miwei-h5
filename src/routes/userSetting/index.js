import React from 'react';
import { connect } from 'dva';
import {
  Cells,
  Cell,
  CellBody,
  CellFooter,
  ActionSheet,
} from 'react-weui';
import { routerRedux } from 'dva/router';

import styles from './index.less';
import avatar_icon from '../../assets/home/touxiang_icon.png';
import { getAddrText, requestJssdkConfig, setGlobalToast, setGlobalLoading,  dataURLtoBlob, toDataUrl, isAndroid } from '../../utils/util';
import { IMG_COMMON_URL } from '../../utils/constant';

class AlarmSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      avatarBase64: '',
      menus: [
        {
          label: '从相册里选取照片',
          onClick: ()=> { this.chooseImageFromAlbum() }
        },
        {
          label: '拍摄照片',
          onClick: ()=> { this.chooseImageFromCamera() }
        },
      ],
      actions: [
        {
          label: '取消',
          onClick: (e) => { this.setState({show: false}) },
        },
      ]
    };
  }

  componentDidMount() {
    document.title = '个人资料';
  }
  componentWillMount() {
    if(isAndroid()) this.chooseImagePre();
  }

  chooseImagePre() {
    requestJssdkConfig(['chooseImage', 'getLocalImgData']).then(() => {
      this.chooseImageReady = true;
    }).catch((err) => console.log('chooseImage ready失败：', err));
  }
  chooseImage = () => {
    const self = this;
    window.wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (rst) {
        setGlobalLoading(true);

        const { localIds } = rst;
        const localId = rst.localIds[0];

        window.wx.getLocalImgData({
          localId: localId,
          success: (res) => {
            const localData = res.localData;
            const base64 = toDataUrl(localData);
            const blob = dataURLtoBlob(base64);
            self.uploadAvatar(blob, base64);
          },
          fail: (error) => {
            setGlobalLoading(false);
            // alert(JSON.parse(error));
          }
        });
      },
      fail: (error) => {
        // alert(JSON.parse(error));
      }
    });
  }

  uploadAvatar = (blob, base64) => {
    let formData = new FormData();
    formData.append('file', blob, Date.now()+ '_img.jpeg');

    const { dispatch } = this.props;
    dispatch({
      type: 'user/uploadImage',
      payload: formData,
      callback: (resp) => {
        // alert('图片上传完成');
        if (resp.errCode === 0) {
          this.setUserAvatar(resp.data.fileID, base64);
        } else {
          setGlobalLoading(false);
        }
      }
    });
  }

  setUserAvatar = (portraitID, base64) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'user/editUserInfo',
      payload: {portraitID},
      callback: (resp) => {
        if (resp.errCode === 0) {
          this.setState({
            avatarBase64: base64,
          });
        }
        setGlobalLoading(false);
      }
    });
  }

  render() {
    const { userInfo, dispatch } = this.props;
    const { addrDetail, district, portraitID, nickName } = userInfo;

    let addrText = '', addrCode;
    if (district) addrCode = district.addrCode;
    if (addrCode) addrText += getAddrText(addrCode).join('') + addrDetail;

    let avatarSrc = '';
    if (portraitID) avatarSrc = IMG_COMMON_URL + portraitID;

    return (
      <div className={styles.alarmSetPage}>
        <Cells>
          <Cell access onClick={this.chooseImage}>
            <CellBody>头像</CellBody>
            <CellFooter>
              <img src={ this.state.avatarBase64 || avatarSrc || avatar_icon} alt="" className={styles.avatar}/>
            </CellFooter>
          </Cell>
          <Cell access onClick={()=>{ dispatch(routerRedux.push('/userInfoChange/name')) }}>
            <CellBody>昵称</CellBody>
            <CellFooter>{nickName || '--'}</CellFooter>
          </Cell>
          <Cell access onClick={()=>{ dispatch(routerRedux.push('/devAddress/userAddr')) }}>
            <CellBody>地址</CellBody>
            <CellFooter>{addrText || '--'}</CellFooter>
          </Cell>
        </Cells>

        <ActionSheet
          type="ios"
          menus={this.state.menus}
          actions={this.state.actions}
          show={this.state.show}
          onRequestClose={e=>this.setState({show:false})}
        />
      </div>
    );
  }
};

const mapStateToProps = state => ({
  userInfo: state.user.userData.userInfo,
});
export default connect(mapStateToProps)(AlarmSet);

