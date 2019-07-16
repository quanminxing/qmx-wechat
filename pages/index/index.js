const { each } = require('../../js/util.js');
let app = getApp()

Page({
	data: {
		bannerSetting: {
			autoplay: true,
			interval: 4000,
			indicatorDot: true,
			indicatorColor: 'rgba(255, 255, 255, .6)',
			indicatorActiveColor: 'rgba(255, 255, 255, 1)'
		},
		banner: [],
		channel: [],
		'tvcImg':  'https://file.qmxpower.com/image/20190419122706.png',
		inputShowed: false,
		inputVal: "",
		videos: [],
		keywords: [],
		reVideos: [],
		char_gt: '>'
	},


  onShareAppMessage(res) {
		app.shareMessage()
  },
	
  onReady: function () {
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.domain + '/package',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data.rows);
        that.setData({
          reVideos:res.data.rows || [],
        });
      }

    });
  },

	
  onShow: function () {
    wx.hideLoading()
		
  },

  onLoad: function () {
		console.log(this.route)
		console.log('999999999999999999993333333333--------------')
    var that = this;

		// banner
		wx.request({
			url: app.globalData.domain + '/api/banner?platform=1',
			header: {
				'Content-Type': 'application/json'
			},
			success(res) {
				console.log(res)
				if (!!res.data.data && res.data.data.length > 0) {
					let banner = res.data.data.sort((a, b) => {
						return b.id - a.id;
					})
					console.log(banner)
					banner.forEach((item) => {
						if (item.type_id === 3) {
							item.showWebView = false
						}
					})
					console.log(banner)
					that.setData({
						banner
					})
				}
			},
			fail(err) {
				console.log(err)
			}
		})

		// 频道
		app.query('/api/channel').then(res => {
			// setData channel
			console.log('channelData  :4444444444444444')
			console.log(res)

			let resData = res.data.data
			this.setData({
				channel: resData
			})
		}).catch(err => {

		})

  },

	showWebView(e) {
		console.log(e.currentTarget.id)
		console.log(each)
		each(this.data.banner, (item) => {
			console.log(item.id === e.currentTarget.id * 1)
			if (item.id === e.currentTarget.id * 1) {
				item.showWebView = true;
				console.log(this.data.banner)

				return false;
			}
		}, this)
		this.setData({
			banner: this.data.banner
		})
	},

	hideWebView(e) {
		console.log('hide webview')
		each(this.data.banner, (item) => {
			console.log(item.id === e.currentTarget.id * 1)
			if (item.id === e.currentTarget.id * 1) {
				item.showWebView = false;
				console.log(this.data.banner)

				return false;
			}
		}, this)
	},


});
