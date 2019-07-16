// pages/brief/success.js
Page({

  data: {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onConfirm(){
    wx.navigateTo({
      url: '/pages/orders/orders',
    });
  },

  onBack() {
    wx.switchTab({
      url: '/pages/find/index',
    });
  }
})