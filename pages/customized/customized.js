//index.js
var cityData = require('../../utils/city.js');

var app = getApp()
Page({
	data: {
		tvcTemp: '类目定制视频列表',
		inputShowed: false,
		inputVal: "",
		tabs: [],
		activeIndex: 0,
		sliderOffset: 30,
		sliderLeft: 0,
		videos: [],
		nv: '',
		qy: '',
		content: [],
		nv: ['衣服', '裤子', '内衣', '服饰', '衣服', '裤子', '内衣', '服饰', '衣服', '裤子', '内衣', '服饰'],
		px: ['默认排序', '离我最近', '价格最低', '价格最高'],
		qyopen: false,
		qyshow: false,
		stopen: false,
		stshow: false,
		nzopen: false,
		pxopen: false,
		nzshow: false,
		pxshow: false,
		isfull: false,
		cityleft: {},
		citycenter: {},
		cityright: {},
		select1: '',
		select2: '',
		shownavindex: '',
		search: {
			_search:true,
			pageNum: 1,
			pageSize: 20,
			sidx: 'price',
			sord: 'asc',
			classify_id: 3,
		},
		usage_name: '',
		category_name: '',
		platform_name: ''
	},

	onReachBottom: function () {
		const that = this;
		wx.showLoading({
			title: '加载中',
			mask: true
		});
		this.data.search.pageNum += 1;

		this.queryList(this.data.search)

		/*
		wx.request({
			url: app.globalData.domain + '/api/video',
			header: {
				'Content-Type': 'application/json'
			},
			data: that.data.search,
			success: function (res) {
				let v = [];
				res.data.data.forEach((d) => {
					// 判断用什么播放器播放
					if (d.url && d.url.indexOf('embed') !== -1) {
						d.url = d.url.match(/vid=([^&]+)/)[1];
						d.isqq = true;
					} else {
						d.isqq = false;
					}
					v.push(d);
				});
				videos = videos.concat(v);
				wx.hideLoading();
				that.setData({
					videos,
					search: that.data.search
				});
				wx.hideLoading()
			}

		});
		*/
	},

	onLoad(e) {
		this.data.search.category_id = e.category_id;
		this.queryList(this.data.search)
	},

	queryList: function(queryData) {
		wx.request({
			url: app.globalData.domain + '/api/video',
			header: {
				'Content-Type': 'application/json'
			},
			data: queryData,
			success: res => {
				let videos = this.data.videos;
				console.log(res)
				res.data.data.forEach((d) => {
					if (d.url && d.url.indexOf('embed') !== -1) {
						d.url = d.url.match(/vid=([^&]+)/)[1];
						d.isqq = true;
					} else {
						d.isqq = false;
					}
					videos.push(d);
				});
				console.log(videos)
				wx.hideLoading();
				this.setData({
					videos,
				});
			}
		})
	},

	onShareAppMessage: function () {

	},

	/*
	onShow: function () {
		console.log('onshow3333333333333333333333333')
		var that = this;

		const app = getApp();
		const openid = app.globalData.openid;

		wx.showLoading({
			title: '加载中',
			mask: true
		});

		wx.request({ // 类目
			url: app.globalData.domain + '/category',
			header: {
				'Content-Type': 'application/json'
			},
			success: function (res) {
				let category = res.data.rows.filter((d) => {
					return d.parent_id === 0
				});

				category.unshift({
					id: 0,
					name: "全部",
				});
				that.setData({
					nv: category,
				});

				console.log(app.globalData)
				let categoryId = app.globalData.tabBarParam.category_id;
				console.log(categoryId)
				if (categoryId === null || categoryId === undefined) {
					// 视频搜索过滤
					that.data.search._search = true;
					console.log(that.data.search)
					wx.request({
						url: app.globalData.domain + '/api/video',
						header: {
							'Content-Type': 'application/json'
						},
						data: that.data.search,
						success: function (res) {
							let videos = [];
							console.log(res)
							res.data.data.forEach((d) => {

								let categoryChoose = that.data.tabs.filter((category) => {
									return category.id === d.category_id
								});

								d.category_name = categoryChoose[0] ? categoryChoose[0].name : '';
								// 判断用什么播放器播放
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
							});
						}

					});
				} else {
					const domain = app.globalData.domain;

					let categoryName = app.globalData.tabBarParam.category_name;
					console.log(categoryId)
					console.log(categoryName)
					const search = that.data.search;
					search._search = true;

					search.pageNum = 1;
					search.category_id = categoryId;
					if (categoryId == 0) {
						delete search.category_id
					}
					const queryString = '';
					wx.showLoading({
						title: '加载中',
						mask: true
					});
					console.log(search)
					wx.request({
						url: domain + '/api/video',
						data: search,
						header: {
							'Content-Type': 'application/json'
						},
						success: function (res) {

							res.data.data = res.data.data.map((d) => {
								// 判断用什么播放器播放
								if (d.url.indexOf('embed') !== -1) {
									d.url = d.url.match(/vid=([^&]+)/)[1];
									d.isqq = true;
								} else {
									d.isqq = false;
								}
								return d
							});
							wx.hideLoading();
							that.setData({
								videos: res.data.data,
								nzopen: false,
								isfull: false,
								shownavindex: 0,
								category_name: categoryName,
								search
							});
							app.globalData.tabBarParam = {}
						}
					});
				}

			}
		});
		wx.hideLoading()
	},
	*/
	
	
	
});
