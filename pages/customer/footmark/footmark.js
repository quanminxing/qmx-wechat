const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
		pageShow:false,
		pageErr: false,
    edit: false,
    select_all: false,
    middlearr: [],
    videos: []
  },

	reload() {
		this.getLog(app.globalData.openid)
	},

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
		console.log(openid)
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
				console.log(res)
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
          videos,
					pageShow: true,
					pageErr: false,
        });
      },
			fail: () => {
				that.setData({
					pageShow: true,
					pageErr: true,
				})
			}
    });
  },

  deleteLog(openid) {
		console.log(openid)
    const that = this;
    const app = getApp();
    const domain = app.globalData.domain;
		let queryData = {
			openid: openid,
			ids: (that.data.middlearr.map((d) => { return d.id })).join(',')
		}
		console.log(queryData)
    console.log(that.data.middlearr);
		console.log((that.data.middlearr.map((d) => { return d.id })).join(','))
    wx.request({
			url: domain + '/api/log/deleteLog',
      header: {
        'content-type': 'application/json'
      },
      data: queryData,
      method: 'POST',
      success: function (res) {
				console.log(res)
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500
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

	onShareAppMessage: function () {

	},
})