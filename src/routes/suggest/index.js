import React from 'react';
import { connect } from 'dva';
import {
  Cells,
  Cell,
  CellBody,
  CellFooter,
  ActionSheet,
  TextArea,
  Form,
  FormCell,
  Label,
  CellHeader,
  Select,
  Button,
  Toast,
} from 'react-weui';
import { routerRedux } from 'dva/router';

import styles from './index.less';
import add_icon from '../../assets/add_icon.png';
import { getAddrText, requestJssdkConfig, setGlobalToast, setGlobalLoading,  dataURLtoBlob, toDataUrl, isAndroid } from '../../utils/util';


class Suggest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      issueList: [],
      imgPaths: [],
      base64List: [],

      show: false,
      menus: [
        {
          label: '从相册里选取照片',
          onClick: ()=> { console.log('click option1') }
        },
        {
          label: '拍摄照片',
          onClick: ()=> { console.log('click option2') }
        },
      ],
      actions: [
        {
          label: '取消',
          onClick: (e) => { this.setState({show: false}) },
        },
      ]
    };

    this.questionDesc = '';
    this.questionIndex = 0;
    this.fileIDs = []; // 存放已上传过的图片id
  }

  componentDidMount() {
    document.title = '意见反馈';
  }
  componentWillMount() {
    if(isAndroid()) this.chooseImagePre();
    this.fetchIssues();
  }
  chooseImagePre() {
    requestJssdkConfig(['chooseImage', 'getLocalImgData']).then(() => {
      this.chooseImageReady = true;
    }).catch((err) => console.log('chooseImage ready失败：', err));
  }
  fetchIssues(){
    const { dispatch } = this.props;
    dispatch({
      type: 'user/queryIssueCategory',
      callback: (resp) => {
        if (resp.errCode === 0) {
          this.setState({issueList: resp.data});
        }
      }
    });
  }


  chooseImage = () => {
    const self = this;
    const { imgPaths } = this.state;
    const remain = 6 - imgPaths.length;

    window.wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (rst) {
        setGlobalLoading(true);
        const { localIds } = rst;
        self.processPaths(localIds);
      },
      fail: (error) => {
        setGlobalLoading(false);
      }
    });
  }

  processPaths = (paths) => {
    let forBase64 = [], forPaths = [];
    for (let i = 0; i < paths.length; i++) {
      window.wx.getLocalImgData({
        localId: paths[i],
        success: (res) => {
          const localData = res.localData;
          const base64 = toDataUrl(localData);
          forBase64.push(base64);
          forPaths.push(paths[i]);

          if (i === paths.length - 1) {
            const { base64List, imgPaths } = this.state;
            this.setState({
              imgPaths: [ ...imgPaths, ...forPaths],
              base64List: [ ...base64List, ...forBase64],
            });
            setGlobalLoading(false);
          }
        },
        fail: (error) => {
          alert(JSON.parse(error));
          setGlobalLoading(false);
        }
      });
    }
  }

  uploadFiles = (listToUpload) => {
    const { dispatch } = this.props;
    let forFileIDs = [];

    listToUpload.forEach((item, index) => {
      let blob = dataURLtoBlob(item);
      let formData = new FormData();
      formData.append('file', blob, Date.now()+ '_img.jpeg');

      dispatch({
        type: 'user/uploadImage',
        payload: formData,
        callback: (resp) => {
          if (resp.errCode === 0) {
            forFileIDs.push(resp.data.fileID);
          } else {
            forFileIDs.push(false);
          }

          if (forFileIDs.length === listToUpload.length) {
            this.fileIDs = forFileIDs.filter(item => !!item);
            // alert('图片上传完成');
            // alert(JSON.stringify(this.fileIDs));
            this.submitIssue();
          }
        }
      });
    });
  }
  submitIssue = () => {
    const { dispatch } = this.props;
    const { questionIndex, questionDesc } = this;

    const params = {
      categoryID: questionIndex,
      descr: questionDesc,
    };
    if (this.fileIDs.length > 0) params.images = this.fileIDs;

    dispatch({
      type: 'user/submitIssue',
      payload: params,
      callback: (resp) => {
        if (resp.errCode === 0) {
          setGlobalToast(true, '感谢您的反馈');
          dispatch(routerRedux.go(-1));
        }
      }
    });
  }

  generateImgList = () =>{
    const { base64List } = this.state;
    return base64List.map((item, index) => {
      return (
        <span>
          <img src={item} alt="" onClick={() => {console.log(index)}}/>
        </span>
      );
    });
  }


  chooseQuestion = (e) => {
    this.questionIndex = e.target.value;
  }
  textareaChange = (e) => {
    this.questionDesc = e.target.value;
  }

  handleSubmit = () => {
    if (!this.questionIndex) {
      setGlobalToast(true, '请选择问题');
      return;
    }

    if (!this.questionDesc.trim()) {
      setGlobalToast(true, '请填写问题描述');
      return;
    }

    const { imgPaths, base64List } = this.state;
    if (imgPaths.length < 1) {
      this.submitIssue();
    } else {
      this.uploadFiles(base64List);
    }
  }

  generateOptions(issueList) {
    const options =  issueList.map((item) => {
      return <option value={item.id} key={item.id}>{item.name}</option>;
    });

    return [
      <option value="0" key="0" disabled={true}>请选择问题</option>,
      ...options
    ];
  }
  render() {
    const { userInfo, dispatch } = this.props;
    const { imgPaths, issueList } = this.state;
    return (
      <div className={styles.alarmSetPage}>
        <Form>
          <FormCell select selectPos="after">
            <CellHeader>
              <Label>反馈问题</Label>
            </CellHeader>
            <CellBody>
              <Select
                defaultValue="0"
                onChange={this.chooseQuestion}
              >
              {this.generateOptions(issueList)}
              </Select>
            </CellBody>
          </FormCell>
        </Form>
        <Form>
          <FormCell>
            <CellBody>
              <TextArea
                placeholder="感谢您的关注与支持，您的宝贵意见我们将尽快改进，谢谢！（限200字）"
                rows="6"
                maxLength={200}
                onChange={this.textareaChange}
              />
            </CellBody>
          </FormCell>
        </Form>

        <p className={styles.uploadTitle}>上传图片<span>(不超过6张)</span></p>
        <div className={styles.imageWraper}>
          {this.generateImgList()}
          {
            imgPaths.length == 6 ? null :
            <span onClick={this.chooseImage}>
              <img src={add_icon} alt=""/>
            </span>
          }
        </div>

        <div className={styles.btnWraper}>
          <Button onClick={this.handleSubmit}>提交</Button>
        </div>

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
  userInfo: state.global.userInfo,
});
export default connect(mapStateToProps)(Suggest);

