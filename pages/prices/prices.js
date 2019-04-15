// pages/prices/prices.js
const { query } = require('../../common')
const app = getApp();


Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		pricesList: [{
			id: '3',  // 视频id
			short_image: '../../images/tvc.png',  // 缩略图
			category_id: '74',  // 类目id
			classify_id: '2',  // 分类
			price: '268',
			name: '功能展示'
		},{
			id: '3',  // 视频id
			short_image: '../../images/tvc.png',  // 缩略图
			category_id: '74',  // 类目id
			classify_id: '2',  // 分类
			price: '268',
			name: '功能展示'
		}],
		tvc: {
			type: 'tvc',
			img: '../../images/tvc.png',
			classify_id: '',
			category_id: ''
		}
	},
/**
 * param {生命周期函数 } options 
 */
	onLoad: function (options) {
		console.log(options)
		let queryData = {
			_search: true,
			category_id: options.category_id,
			classify_id: 2
		}
		query('/api/video', queryData).then(res => {

		}).catch(err => [

		])
	},

	onReady: function () {

	},

	onShow: function () {

	},

	onHide: function () {

	},

	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数
	 */
	onPullDownRefresh: function () {

	},

	onReachBottom: function () {

	},

	onShareAppMessage: function () {

	},

	/**
	 * 其他事件函数
	 */
	toTvc(e) {
		console.log(e)
		app.globalData.tabBarParam = {

		}
	},
	
})