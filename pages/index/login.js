// pages/index/login.js
Page({

  onShow: function () {
    wx.hideLoading()
  },
  
  onShow: function () {
    wx.hideLoading()
  },

  onGotUserInfo: function (e) {
    const app = getApp();
    app.globalData.userInfo = e.detail.userInfo;

    app.login(function(){
      wx.navigateBack({
        url: '../find/index',
				success() {
					console.log('call back  success')
				},
				fail(err) {
					console.log(err)
				}
      });
      /*
      wx.navigateBack({
        delta: 1
      });*/
    });
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