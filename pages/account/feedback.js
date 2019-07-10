// pages/account/feedback.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal:''
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  sendmail:function(){
    const that = this;
    const app = getApp()
    app.getUserInfo(function (e) {
        let opts = {
          url: app.globalData.domain + '/api/sendMail',
          data: {
            title: '来自'+e.nickName+'的意见反馈',
            text: that.data.inputVal,
          },
          method: 'GET',
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            wx.showToast({
              title: '发送成功',
              icon: 'success',
              duration: 1000
            });
            wx.navigateTo({
              url: '/pages/account/index',
            });
          },
          fail: function (res) {
            console.log('获取登录信息失败');
          }
        }
        wx.request(opts);
      }
    );
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		
  },

	imgLoad: app.drawWaterfall,

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})