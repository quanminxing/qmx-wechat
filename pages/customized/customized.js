const app = getApp();
let _search = {
	pageNum: 1,
	pageSize: 20,
	_search: true,
	classify_id: '3'   // 定制非TVC类
}

Page({

	data: {
		pageShow: false,
		pageErr: false,
		videos: []
	},

	/**
	 * 页面处理函数
	 */
	queryList() {
		console.log(_search)
		return app.query('/api/video', _search).then(res => {
			let videos = res.data.data;
			console.log(videos)
			let videosData = videos.map(item => {
				return {
					id: item.id,
					name: item.name,
					waterfall_image: item.waterfall_image,
					price: item.price,
					classify_id: item.classify_id
				}
			})
			this.data.videos.push(...videosData)
			this.setData({
				videos: this.data.videos
			})
			return new Promise(resolve => {
				resolve(videos)
			})
		}).catch(err => {
			return new Promise((resolve, reject) => {
				reject(err)
			})
		})
	},

	/**
	 * 页面事件函数
	 */
	reload() {
		app.loading()
		console.log('reload')
		this.queryList().then(video => {
			this.setData({
				pageShow: true,
				pageErr: false,
			})
			wx.hideLoading()
		}).catch(err => {
			this.setData({
				pageShow: true,
				pageErr: true,
			})
			wx.hideLoading()
		})
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {
		app.loading();
		console.log(e)
		_search.category_id = e.category_id;
		this.queryList().then(video => {
			this.setData({
				pageShow: true,
				pageErr: false,
			})
			wx.hideLoading()
		}).catch(err => {
			this.setData({
				pageShow: true,
				pageErr: true,
			})
			wx.hideLoading()
		})
	},

	onReachBottom: function () {
		app.loading();
		_search.pageNum = ++_search.pageNum;
		this.queryList().then(videos => {
			wx.hideLoading();
			if(videos.length === 0) {
				console.log('没有更多数据了')
			}
		})
	},

	onShareAppMessage: function () {
		
	}
})