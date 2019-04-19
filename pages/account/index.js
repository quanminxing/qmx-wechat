//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function (options) {

    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    app.getUserInfo(function (userInfo) {
      if (!openid) {
        app.login(function (openid) {
          that.getUser(openid);
        });
      } else {
        that.getUser(openid);
      }
    }),
      wx.setNavigationBarTitle({
        title: '个人中心'
      })

  },

  getUser(openid) {
    const app = getApp();
    const that = this;
    const userInfo = app.globalData.userInfo;
    console.log(app.globalData);
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.domain + '/api/user?openid=' + openid,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(userInfo);
        let user = {};
        let exist = res.data.rows;
        if (!exist) {
          user.name = userInfo.nickName;
          user.phone = '';
          user.company = '';
        } else {
          user = exist;
          if (!user.name) {
            user.name = userInfo.nickName;
          }
          if (!user.company) {
            user.company = ''
          }
          if (!user.phone) {
            user.phone = ''
          }
        }
        user.avatarUrl = userInfo.avatarUrl;
        that.setData({
          userInfo: user
        });
        wx.hideLoading();
        //wx.setStorageSync('video', video);
      }
    });
  },

	onShareAppMessage: function () {

	}
})
