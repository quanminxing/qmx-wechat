// pages/account/info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */

  /**
   * 生命周期函数--监听页面加载
   */
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})