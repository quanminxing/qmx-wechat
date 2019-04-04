//index.js
const { each } = require('../../utils/util.js');
var app = getApp()
Page({
	data: {
		bannerSetting: {
			autoplay: true,
			interval: 3000,
			indicatorDot: true,
			indicatorColor: 'rgba(255, 255, 255, .6)',
			indicatorActiveColor: 'rgba(255, 255, 255, 1)'
		},
		banner: [],
		category: [{
			img: '../../images/category1.png',
			id: '74',
			name: '美妆'
		},{
			img: '../../images/category2.png',
			id: '77',
			name: '食品'
		},{
			img: '../../images/category3.png',
			id: '76',
			name: '母婴'
		},{
			img: '../../images/category4.png',
			id: '94',
			name: '小家电'
		}],
		tvc:  '../../images/tvc.png',
		inputShowed: false,
		inputVal: "",
		videos: [],
		keywords: [],
		reVideos: [],
		char_gt: '>'
	},

	switchTab(e) {
		console.log(e)
		let categoryId = e.currentTarget.dataset.id;
		console.log(categoryId)
		app.globalData.tabBarParam = {
			category_id: categoryId,
			category_name: e.currentTarget.dataset.name
		};
		wx.switchTab({
			url: '../video/index'
		})
	},

  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '全民星短视频',
      path: '/pages/find/index'
    }
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
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    console.log(1111);
  },
  
  showInput: function () {
    wx.navigateTo({
      url: '/pages/find/search',
    })
  },
makephonecall:function(){
  wx.makePhoneCall({
    phoneNumber: '17034642312',
  })
},
  onShow: function () {
    wx.hideLoading()
  },

  onLoad: function () {
    var that = this;

		// banner
		wx.request({
			url: app.globalData.domain + '/api/banner?platform=1',
			header: {
				'Content-Type': 'application/json'
			},
			success(res) {
				// console.log(res)
				if (!!res.data.results && res.data.results.length > 0) {
					let banner = res.data.results.sort((a, b) => {
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

    /*
    wx.getSystemInfo({
        success: function (res) {
            that.setData({
                sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
            });
        }
    });*/
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

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

});
