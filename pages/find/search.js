
var app = getApp()
Page({
  onReady: function () {
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.domain + '/video/listByRecommand',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let videos = [];
        res.data.rows.forEach((d) => {
          if (d.url && d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          videos.push(d);
        });
        wx.hideLoading();
        that.setData({
          reVideos: videos,
        });
      }

    });
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    console.log(1111);
  },
  getKeyword(openid) {
    const that = this;
    const app = getApp();
    const domain = app.globalData.domain;
    wx.request({
      url: domain + '/api/keyword/listByUser?openid=' + openid,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let keywords = [];
        res.data.rows.forEach((d) => {
          keywords.push(d.keyword);
        });
        wx.hideLoading()
        that.setData({
          keywords
        });
      }
    });
  },
  data: {
    inputShowed: true,
    inputVal: "",
    videos: [],
    keywords: [],
    reVideos: []
  },

  initKeyword: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    const that = this;
    const app = getApp();
    const openid = app.globalData.openid;

    if (!openid) {
      app.login(function (openid) {
        that.getKeyword(openid);
      });
    } else {
      that.getKeyword(openid);
    }
  },

  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false,
      videos: []
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: "",
      videos: []
    });
  },
  searchByKeyword(openid) {
    const that = this;
    if (this.data.inputVal.trim() === '') {
      wx.showToast({
        title: '请填写搜索条件',
        icon: 'none',
        duration: 1000
      });
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    const app = getApp();
    const domain = app.globalData.domain;

    wx.request({
      url: domain + '/api/keyword',
      header: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      data: {
        keyword: this.data.inputVal,
        openid
      },
      success: function (res) {
        console.log('搜索词记录完成');
      }
    });

    wx.request({
      url: domain + '/api/video',
      data: {
				_search: true,
				name: this.data.inputVal.trim()
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        let videos = [];
        res.data.data.forEach((d) => {
          if (d.url && d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          videos.push(d);
        });
        that.setData({
          videos
        })
      },
      fail: function (res) {

        // fail
      },
      complete: function (res) {
        // complete

      }
    })
  },
  cleanhistory(e) {
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.clean(openid);
      });
    } else {
      that.clean(openid);
    }
  },

  clean(openid) {
    const that = this;
    //弹窗

    wx.showModal({
      content: '确定要删除历史记录吗',
      success: function (res) {
        if (res.confirm) {

          wx.showLoading({
            title: '加载中',
            mask: true
          });
          const app = getApp();
          const domain = app.globalData.domain;

          wx.request({
            url: domain + '/api/keyword/deleteKeyword?openid=' + openid,
            header: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            success: function (res) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1000
              });
              that.setData({
                keywords: []
              });
            }
          });
        } else if (res.cancel) {
          return
        }
      }
    })

  },
  usesearch(e) {
    this.setData({
      inputVal: e.currentTarget.dataset.keyword
    });
    this.search();
  },
  search: function () {
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.searchByKeyword(openid);
      });
    } else {
      that.searchByKeyword(openid);
    }

  },
  inputTyping: function (e) {
    let inputVal = e.detail.value;
    this.setData({
      inputVal
    });
    if (e.detail.value.trim() === '') {
      this.setData({
        inputVal: "",
        inputShowed: false,
        videos: []
      });
    }

  },
  onShow: function () {
    wx.hideLoading()
  },

  onLoad: function () {
    var that = this;
    /*
    wx.getSystemInfo({
        success: function (res) {
            that.setData({
                sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
            });
        }
    });*/

  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

	onShareAppMessage: function () {

	},

});
