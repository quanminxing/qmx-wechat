// pages/my/log.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    edit: false,
    select_all: false,
    middlearr: [],
    videos: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const that = this;
    const app = getApp();
    const openid = app.globalData.openid;

    if (!openid) {
      app.login(function (openid) {
        that.getLog(openid);
      });
    } else {
      that.getLog(openid);
    }
  },
  getLog(openid) {
    const that = this;
    const app = getApp();
    const domain = app.globalData.domain;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: domain + '/api/log/listByUser?openid=' + openid,
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
          videos
        });
      }
    });
  },

  deleteLog(openid) {
    const that = this;
    const app = getApp();
    const domain = app.globalData.domain;
    console.log(that.data.middlearr);
    wx.request({
      url: domain + '/api/log/deleteLog?openid=' + openid,
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        ids: (that.data.middlearr.map((d) => { return d.video_id })).join(',')
      },
      method: 'POST',
      success: function (res) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1000
        });

        let arr = that.data.videos;
        let arr2 = [];
        for (let i = 0; i < arr.length; i++) {
          if (!arr[i].checked || arr[i].checked == false) {
            arr2.push(arr[i]);
          }
        }
        that.setData({
          videos: arr2,
          middlearr: []
        });
      }
    });
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

  },

  onEdit() {
    this.setData({
      edit: true
    })
  },
  onCancelEdit() {
    this.setData({
      edit: false
    })
  },
  onSelectAll() {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    if (that.data.select_all) {
      let arr = that.data.videos;
      let arr2 = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].checked == true) {
          arr2.push(arr[i]);
        } else {
          arr[i].checked = true;
          arr2.push(arr[i]);
        }
      }

      that.setData({
        videos: arr2,
        middlearr: arr2
      })
    }
  },

  onDelete() {
    const that = this;
    const app = getApp();
    const openid = app.globalData.openid;
    if (that.data.middlearr.length === 0) {
      wx.showToast({
        title: '请选择后删除',
        icon: 'fail',
        duration: 1000
      });

      return
    }

    if (!openid) {
      app.login(function (openid) {
        that.deleteLog(openid);
      });
    } else {
      that.deleteLog(openid);
    }
  },

  select: function (e) {
    var that = this;
    let arr2 = [];
    if (that.data.edit == false) {
      return;
    } else {
      var arr = that.data.videos;
      var index = e.currentTarget.dataset.id;
      arr[index].checked = !arr[index].checked;
      console.log(arr);

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].checked) {
          arr2.push(arr[i])
        }
      };
      that.setData({
        videos: arr,
        middlearr: arr2
      })
    }
  },
  // 删除
  deleteitem: function () {
    var that = this;
    let arr = that.data.items;
    let arr2 = [];
    console.log(arr);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].checked == false) {
        arr2.push(arr[i]);
      }
    }
    that.setData({
      items: arr2,
      middlearr: []
    })
  },

  // 取消全选
  onSelectNone: function () {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    let arr = that.data.videos;
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
      arr[i].checked = false;
      arr2.push(arr[i]);
    }
    that.setData({
      videos: arr2,
      middlearr: []
    })
  },
})