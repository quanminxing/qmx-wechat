// pages/video/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    video_id: null,
		baseInfo: [],
    isFav: false,
    more:false,
		disabled: true
  },

  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    const video_id = options.video_id;
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
		console.log(app)
		console.log(openid)
    if (!openid) {
      app.login(function (openid) {
        that.recordLog(openid, video_id);
      });
    }else{
      that.recordLog(openid, video_id);
    }

    const id = options.video_id;
		console.log(options)
		console.log(app)
		console.log(app.globalData.domain + '/api/video?_search=true&id=' + id)
    wx.request({
      url: app.globalData.domain + '/api/video?_search=true&id=' + id,
      success: function (res) {
        console.log(res)
				if(res.data.data.length > 0) {
					let video = res.data.data[0];
					wx.setNavigationBarTitle({
						title: video.name,
					})
					console.log('有视频数据')
					that.data.baseInfo = [{
						label: '类目',
						name: video.categroy_name
					}, {
						label: '视频比例',
						name: video.scale_id
					}, {
						label: '平台',
						name: video.platform_name
					}, {
						label: '时长',
						name: video.time
					}, {
						label: '栏目',
						name: video.column_name
					}]
					
					video['demo_pics'] = []
					if (video['demo_pic']) {
						// video['demo_pics'] = video['demo_pic'].split('|')
						video['demo_pic'].split('|').forEach(item => {
							console.log(item)
							if(!!item) {
								let arrayItem = item.split(',')
								video['demo_pics'].push({
									img_url: arrayItem[0],
									video_id: arrayItem[1] || ''
								})
							}
							
						})
						console.log(video['demo_pics'])
					} else {
						video['demo_pics'] = []
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
						disabled: false,
						baseInfo: that.data.baseInfo
					});
				}
        wx.hideLoading();
        // wx.setStorageSync('video', video);
      }
    });
    
  },
  addFav(){
    const video_id = this.data.video_id;
    const app = getApp();
		console.log(app)
    const openid = app.globalData.openid;
    const that = this;
		console.log(openid)
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
		console.log(openid)
    if (!openid) {
      app.login(function (openid) {
        that.fav(openid, video_id);
      });
    } else {
      that.fav(openid, video_id);
    }
  },
  fav(openid,video_id){

		console.log(openid)
    const app = getApp();
    const domain = app.globalData.domain;
    const that = this;
		// console.log(this.data.isFav)
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
        console.log(res)
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
					isFav: !that.data.isFav
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

	toVideoDetail(e) {
		console.log(e.currentTarget.dataset.origin)
		let originData = e.currentTarget.dataset.origin;
		if (!!originData.video_id && originData.video_id !== 'null') {
			wx.navigateTo({
				url: '/pages/video/detail?video_id=' + originData.video_id,
			})
		}
	},
	onShareAppMessage: function () {

	},

})