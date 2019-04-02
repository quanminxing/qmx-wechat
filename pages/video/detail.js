// pages/video/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    video_id:undefined,
    reVideos:[],
    isFav: false,
    more:false,
		disabled: true
  },

  showmore: function () {
    this.setData({
      more: true
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
    }else{
      that.recordLog(openid, video_id);
    }

    const id = options.id;
    wx.request({
      url: app.globalData.domain + '/video/detail?id=' + id,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        let video = res.data.detail[0];
        
        if(video['demo_pic']){
          video['demo_pics'] = video['demo_pic'].split('|')
        }else{
          video['demo_pics'] = []
        }

        if (video.keystring) {
          video.keystring = video.keystring.split('\n');
          video.keystring = video.keystring.map((key) => {
            return key.split('|')
          });
        } else {
          video.keystring = '';
        }

        if (video.url && video.url.indexOf('embed') !== -1) {
          video.url = video.url.match(/vid=([^&]+)/)[1];
          video.isqq = true;
        } else {
          video.isqq = false;
        }

        that.setData({
          video,
          video_id,
					disabled: false
        });
        
        // wx.request({
        //   url: app.globalData.domain + '/video/listByRecommand?category_id=' + video.category_id,
        //   header: {
        //     'Content-Type': 'application/json'
        //   },
        //   success: function (res) {
        //     let videos = [];
        //     res.data.rows.forEach((d) => {
        //       if (d.url && d.url.indexOf('embed') !== -1) {
        //         d.url = d.url.match(/vid=([^&]+)/)[1];
        //         d.isqq = true;
        //       } else {
        //         d.isqq = false;
        //       }
        //       videos.push(d);
        //     });
        //     that.setData({
        //       reVideos: videos,
        //     });
        //   }

        // });

        wx.hideLoading();
        wx.setStorageSync('video', video);
      }
    });
    
  },
  addFav(){
    const video_id = this.data.video_id;
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.fav(openid, video_id);
      });
    } else {
      that.fav(openid, video_id);
    }
  },
  deleteFav() {
    const video_id = this.data.video_id;
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.fav(openid, video_id);
      });
    } else {
      that.fav(openid, video_id);
    }
  },
  fav(openid,video_id){
    const app = getApp();
    const domain = app.globalData.domain;
    const that = this;
    wx.request({
      url: domain + '/api/fav',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        openid,
        video_id,
        isFav: that.data.isFav
      },
      method: 'POST',
      success: function (res) {
        
        if(!that.data.isFav){
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 1000
          });
        }else{
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            duration: 1000
          });
        }
        that.setData({
          isFav:!that.data.isFav
        });
        console.log('收藏成功！openid:' + openid + ', id:' + video_id);
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
        if(res.data.result && res.data.result.length!==0){
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