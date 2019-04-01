// pages/video/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    video_id: undefined,
    reVideos: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    more:false,
		disabled: true
  },

  showmore: function () {
    this.setData({
      more: true
    })
  },
  changeVideo:function(event){
    let video = this.data.videos[event.detail.current];
    this.setData({
      video
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.setStorageSync('info', this.data.info);
    // var data = wx.getStorageSync('video');
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    const video_id = options.id;
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.recordLog(openid, video_id);
      });
    } else {
      that.recordLog(openid, video_id);
    }

    const id = options.id;
    wx.request({
      url: app.globalData.domain + '/package/findVideoByPackageId?id=' + id,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let videos = res.data || [];

        videos = videos.map((video)=>{

          if(video[0]['demo_pic']){
            video[0]['demo_pics'] = video[0]['demo_pic'].split('|')
          }else{
            video[0]['demo_pics'] = []
          }

          if (video[0].keystring) {
            video[0].keystring = video[0].keystring.split('\n');
            video[0].keystring = video[0].keystring.map((key) => {
              return key.split('|')
            });
          } else {
            video[0].keystring = '';
          }

          if (video[0].url && video[0].url.indexOf('embed') !== -1) {
            video[0].url = video[0].url.match(/vid=([^&]+)/)[1];
            video[0].isqq = true;
          } else {
            video[0].isqq = false;
          }
          return video[0]
        })
      
        that.setData({
          videos,
          video:videos[0],
					disabled: false
        });
        wx.hideLoading();
      }
    });

  },

  recordLog(openid, video_id) {
    const app = getApp();
    const domain = app.globalData.domain;
    const that = this;
    wx.request({
      url: app.globalData.domain + '/api/fav/findByUser?openid=' + openid + '&id=' + video_id,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.result && res.data.result.length !== 0) {
          that.setData({
            isFav: true,
          });
        }
      }

    });
    wx.request({
      url: domain + '/api/log',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        openid,
        video_id,
      },
      method: 'POST',
      success: function (res) {
        console.log('记录日志成功！openid:' + openid + ', id:' + video_id);
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