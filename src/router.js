import React from 'react';
import { Route, Switch, routerRedux } from 'dva/router';
import dynamic from 'dva/dynamic';
import { Toast } from 'react-weui';
// import { persistStore, REHYDRATE } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { createPersistorIfNecessary } from './index'

import GlobalToast from './globalToast';
import GlobalLoading from './globalLoading';
import GlobalDialog from './globalDialog';

const modelNotExisted = (app, modelName) => (
  !app._models.some(({ namespace }) => {
    return namespace === modelName;
  })
);

const generateModelList = (app, models) => {
  const modelList = [];
  models.forEach( (modelName) => {
    if (modelNotExisted(app, modelName)) {
      modelList.push(import(`./models/${modelName}`));
    }
  });
  return modelList;
}

const Loading = <Toast icon="loading" show={true} />;
dynamic.setDefaultLoadingComponent(() => Loading);

const { ConnectedRouter } = routerRedux;
function RouterConfig({ history, app }) {
  const Home = dynamic({
    app,
    models: () => generateModelList(app, ['user','home','devices','messages','global']),
    component: () => import('./routes/home'),
  });
  const SnInput = dynamic({
    app,
    models: () => generateModelList(app, ['snInput']),
    component: () => import('./routes/snInput'),
  });
  const AddDevice = dynamic({
    app,
    models: () => generateModelList(app, ['user', 'snInput']),
    component: () => import('./routes/addDevice'),
  });
  const Pay = dynamic({
    app,
    models: () => generateModelList(app, ['snInput', 'user']),
    component: () => import('./routes/pay'),
  });
  const About = dynamic({
    app,
    models: [],
    component: () => import('./routes/about'),
  });
  const DeviceDetail = dynamic({
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/deviceDetail'),
  });
  const TimerSet = dynamic({ // 定时设置
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/timerSet'),
  });
  const EditTimer = dynamic({ // 编辑定时
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/timerSet/EditTimer'),
  });
  const PickDays = dynamic({ // 选择重复
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/timerSet/PickDays'),
  });

  const Login = dynamic({
    app,
    models: () => generateModelList(app, ['user']),
    component: () => import('./routes/login'),
  });
  const Register = dynamic({
    app,
    models: () => generateModelList(app, ['user']),
    component: () => import('./routes/register'),
  });
  const OrderList = dynamic({
    app,
    models: () => generateModelList(app, ['orderList']),
    component: () => import('./routes/orderList'),
  });
  const AlarmSet = dynamic({
    app,
    models: () => generateModelList(app, ['alarmSet']),
    component: () => import('./routes/alarmSet'),
  });
  const DeviceSet = dynamic({
    app,
    models: () => generateModelList(app, ['deviceDetail', 'user']),
    component: () => import('./routes/deviceSet'),
  });
  const DevName = dynamic({
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/devName'),
  });
  const DevAddress = dynamic({
    app,
    models: () => generateModelList(app, ['user', 'deviceDetail']),
    component: () => import('./routes/devAddress'),
  });
  const WifiSet = dynamic({
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/wifiSet'),
  });
  const MatchDevice = dynamic({
    app,
    models: () => generateModelList(app, ['deviceDetail']),
    component: () => import('./routes/matchDevice'),
  });
  const UserSetting = dynamic({
    app,
    models: () => generateModelList(app, ['user']),
    component: () => import('./routes/userSetting'),
  });
  const UserInfoChange = dynamic({
    app,
    models: () => generateModelList(app, ['user']),
    component: () => import('./routes/userSetting/UserInfoChange'),
  });
  const Suggest = dynamic({
    app,
    models: () => generateModelList(app, ['user']),
    component: () => import('./routes/suggest'),
  });


  return (
    <PersistGate persistor={createPersistorIfNecessary(app._store)} loading={Loading}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route name="snInput" path ="/snInput" component={SnInput}/>
          <Route name="addDevice" path ="/addDevice" component={AddDevice}/>
          <Route name="pay" path ="/pay/:deviceID" component={Pay}/>
          <Route name="deviceDetail" path ="/deviceDetail" component={DeviceDetail}/>
          <Route name="timerSet" path ="/timerSet" exact component={TimerSet}/>
          <Route name="editTimer" path ="/timerSet/edit" exact component={EditTimer}/>
          <Route name="pickDays" path ="/timerSet/edit/pickDays" component={PickDays}/>
          <Route name="login" path ="/login" component={Login}/>
          <Route name="register" path ="/register/:type" component={Register}/>
          <Route name="orderList" path ="/orderList" component={OrderList}/>
          <Route name="alarmSet" path ="/alarmSet" component={AlarmSet}/>
          <Route name="deviceSet" path ="/deviceSet" component={DeviceSet}/>
          <Route name="devName" path ="/devName" component={DevName}/>
          <Route name="devAddress" path ="/devAddress/:type" component={DevAddress}/>
          <Route name="wifiSet" path ="/wifiSet" component={WifiSet}/>
          <Route name="matchDevice" path ="/matchDevice" component={MatchDevice}/>
          <Route name="userSetting" path ="/userSetting" component={UserSetting}/>
          <Route name="UserInfoChange" path ="/userInfoChange/:type" component={UserInfoChange}/>
          <Route name="suggest" path ="/suggest" component={Suggest}/>
          <Route name="about" path ="/about" component={About}/>

          <Route name="home" path ="/" component={Home}/>
        </Switch>
      </ConnectedRouter>
      <GlobalToast />
      <GlobalLoading />
      <GlobalDialog />
    </PersistGate>
  );
}

export default RouterConfig;
