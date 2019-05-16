// pages/search/search.js
const app = getApp();
let _search = {
	_search: true,
	pageSize: 20,
	pageNum: 1,
	classify_id: '1,3'
}

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		history: [],
		results: [],
		searchValue: '',
		searchClear: false,
		showHistory: true
	},

	// 事件处理函数
	showClear(e) {
		console.log('搜索输入')
		console.log(e.detail.value)
		let value = e.detail.value;
		if (value) {
			this.setData({
				searchClear: true,
				searchValue: value
			})
		} else {
			this.setData({
				searchClear: false,
				searchValue: value,
				showHistory: true
			})
		}
	},

	clearInput() {
		this.setData({
			searchValue: '',
			searchClear: false,
			showHistory: true
		})
	},

	searchHistory(e) {
		console.log(e.currentTarget.dataset.value)
		this.data.searchValue = e.currentTarget.dataset.value
		this.setData({
			searchValue: this.data.searchValue,
			searchClear: true
		})
		this.search()
		// app.loading()
		// this.data.results = [];
		// _search.pageNum = 1;
		// this.searchList()
	},

	search() {
		if(!!this.data.searchValue.trim()) {
			app.loading()
			this.data.results = [];
			_search.pageNum = 1;
			this.searchList();
			app.query('/api/keyword', {
				keyword: this.data.searchValue,
				openid: app.globalData.openid
			}, 'POST').then(res => {
				console.log('搜索词记录成功')
				console.log(res)
				this.queryHistory();
			})
		} else {
			wx.showToast({
				title: '请填写搜索条件',
				icon: 'none',
				time: 2000
			})
		}
		
	},

	clearHistory() {
		wx.showModal({
			title: '确定要删除历史记录吗',
			success: res => {
				if (res.confirm) {
					console.log(app.globalData.openid)
					app.query('/api/keyword/deleteKeyword?openid=' + app.globalData.openid, '', 'POST').then(res => {
						console.log(res)
						wx.showToast({
							title: '删除成功！',
							time: 2000
						})
						this.setData({
							history: []
						})
					})
				}
			}
		})
	},

	// 页面函数
	searchList() {
		let queryData = _search;
		queryData.name = this.data.searchValue.trim();
		app.query('/api/video', queryData).then(res => {
			console.log(res.data.data)
			let data = res.data.data
			this.data.results.push(...data.map(item  => {
				return {
					id: item.id,
					name: item.name,
					category_id: item.category_id,
					short_image: item.short_image,
					classify_id: item.classify_id,
					price: item.price
				}
			}));
			this.setData({
				results: this.data.results,
				showHistory: false
			})
			wx.hideLoading()
		}).catch(err => {
			console.log(err)
		})
	},

	queryHistory() {
		app.query('/api/keyword/listByUser', { openid: app.globalData.openid }).then(res => {
			console.log(res)
			let data = res.data.rows
			this.data.history = data.map(item => item.keyword).slice(0, 10)
			this.setData({
				history: this.data.history
			})
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.queryHistory()
		// _search.pageNum = 1;
		// app.query('/api/keyword/listByUser', { openid: app.globalData.openid}).then(res => {
		// 	console.log(res)
		// 	let data = res.data.rows
		// 	this.data.history = data.map(item => item.keyword).slice(0, 10)
		// 	this.setData({
		// 		history: this.data.history
		// 	})
		// })
	},

	onReachBottom: function () {
		_search.pageNum = ++_search.pageNum;
		this.searchList()
	},
	
})