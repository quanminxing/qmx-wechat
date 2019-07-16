Page({

  data: {

  },
  onLoad: function (options) {
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.getUser(openid);
      });
    } else {
      that.getUser(openid);
    }
  },
  onShow: function (options) {
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.getUser(openid);
      });
    } else {
      that.getUser(openid);
    }
  },

  getUser(openid) {
    const app = getApp();
    const that = this;
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
        let user = {};
        let exist = res.data.rows;
        if (!exist){  
          user.name = app.globalData.userInfo.nickName;
          user.phone = '';
          user.company = '';
        }else{
          user = exist;
          console.log(app.globalData)
          if (!user.name){
            user.name = app.globalData.userInfo.nickName;
          }
          if (!user.company){
            user.company = ''
          }
          if (!user.phone){
            user.phone = ''
          }
        }
        that.setData({
          user
        });
        wx.hideLoading();
        //wx.setStorageSync('video', video);
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})