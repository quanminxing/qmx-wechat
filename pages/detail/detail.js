// pages/detail/detail.js
const app = getApp();
let event = {
	video_id: null,
	classify_id: null,
};

let sample_search = {
	pageNum: 1,
	pageSize: 20,
	_search: true,
}
Page({
	data: {
		pageShow: false,
		pageErr: false,
		video: {},
		baseInfo: [],
		sample: [],
		sampleMore: true,
		isFav: false
	},

	/**
	 * 页面处理函数
	 */

	ifEmpty(value, label='其他') {
		if(!!value && value !== 'null'){
			return value
		} else {
			return label
		}
	},

	suitType(ids, info) {
		if(!ids) return

		let names = ids.split(',').map(id => {
			let name = ''
			info.forEach(item => {
				if(item.id == id) {
					name = item.name
				}
			})
			return name;
		})
		return names.join('、')
	},

	/**
 * 页面事件函数
 */
	reload() {
		console.log('reload')
		this.onLoad(event)
	},

	viewMore() {
		app.loading()
		sample_search.pageNum = ++sample_search.pageNum; 
		console.log(sample_search)
		app.query('/api/video', sample_search).then(res => {
			if(sample_search.pageNum >= Math.ceil(res.data.total / sample_search.pageSize)) {
				this.setData({
					sampleMore: false
				})
			}
			this.data.sample.push(...res.data.data.map(item => {
				return {
					id: item.id,
					name: item.name,
					waterfall_image: item.waterfall_image,
					price: item.price,
					classify_id: item.classify_id
				}
			}))
			this.setData({
				sample: this.data.sample
			})
			wx.hideLoading()
		}).catch(err => {
			console.log(err)
		})
	},

	toggleFav() {
		app.query('/api/fav', { openid: app.globalData.openid, video_id: event.video_id, isFav: this.data.isFav}, 'POST').then(res => {
			if (!this.data.isFav) {
				wx.showToast({
					title: '收藏成功',
					icon: 'success',
					duration: 1000
				});
			} else {
				wx.showToast({
					title: '取消收藏',
					icon: 'success',
					duration: 1000
				});
			}
			this.setData({
				isFav: !this.data.isFav
			});
		})
	},

	toVideos() {
		app.globalData.tabBarParam.sample = {
			category_id: this.data.video.category_id
		}
		wx.switchTab({
			url: '/pages/videos/videos',
		})
	},

	playVideo() {
		let queryData = {
			user_id: app.globalData.openid,
			video_id: this.data.video.id,
			kind: 'play'
		}
		console.log(queryData)
		app.query('/api/log', queryData, 'POST').then(res => {
			console.log(res)
		})
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {
		console.log('onload8888888888888888888888888888888')
		console.log(e)
		app.loading();
		event = {
			video_id: e.video_id,
			classify_id: e.classify_id
		}
		sample_search.pageNum = 1;
		
		let videoInfo = app.query('/api/video', { _search: true, id: e.video_id });
		let regard = app.query('/api/info/regard')
		let fav = app.query('/api/fav/findByUser', {openid: app.globalData.openid, id: e.video_id})
		let video = {};
		let baseInfo = [];
		let sample = [];
		let isFav = false;
		let sampleMore = true;


		if(e.classify_id == 2) {  // 讲解类视频
			sample_search.related_id = e.video_id;
			sample_search.classify_id = 1;
			let platforms = app.query('/platform');
			let category = app.query('/category');
			let samples = app.query('/api/video', sample_search)
			console.log(sample_search)

			Promise.all([videoInfo, platforms, category, samples, fav, regard]).then(infos => {
				console.log('讲解、infos')
				console.log(infos)
				let videoInfo = infos[0].data.data[0]
				video = {
					id: videoInfo.id,
					url: videoInfo.url,
					name: videoInfo.name,
					price: videoInfo.price,
					script_url: videoInfo.script_url || '',
					classify_id: videoInfo.classify_id,
					category_id: videoInfo.category_id,
					regard: infos[5].data.data.content.split('\\n')
				}
				baseInfo = [
					{
						label: '适用平台',
						// name: this.suitType('31', infos[1].data.rows) || '其他'
						name: videoInfo.platform && videoInfo.platform.split(',').join('、') || '其他'
					},
					{
						label: '适用品类',
						// name: this.suitType('74,75,95', infos[2].data.rows) || '其他'
						name: videoInfo.category && videoInfo.category.split(',').join('、') || '其他'
					},
					{
						label: '时长',
						name: videoInfo.time || '其他'
					}
				]
				
				if (sample_search.pageNum >= Math.ceil(infos[3].data.total / sample_search.pageSize)) {
					sampleMore = false;
				}
				sample = infos[3].data.data.map(item => {
					return {
						id: item.id,
						name: item.name,
						waterfall_image: item.waterfall_image,
						price: item.price,
						classify_id: item.classify_id
					}
				})

				if (!!infos[4].data.result && infos[4].data.result.length !== 0) {
					isFav = true;
				}

				this.setData({
					pageShow: true,
					pageErr: false,
					video,
					baseInfo,
					sample,
					isFav,
					sampleMore
				})
				wx.hideLoading()
			}).catch(err => {
				console.log('讲解、err')
				console.log(err)
				this.setData({
					pageShow: true,
					pageErr: true,
				})
				wx.hideLoading()
			})
		} else { // 非讲解类视频
			Promise.all([videoInfo, fav, regard]).then(infos => {
				console.log('非讲解、infos')
				console.log(infos)
				let videoInfo = infos[0].data.data[0]
				video = {
					id: videoInfo.id,
					url: videoInfo.url,
					name: videoInfo.name,
					price: videoInfo.price,
					script_url: videoInfo.script_url || '',
					category_id: videoInfo.category_id,
					classify_id: videoInfo.classify_id,
					regard: infos[2].data.data.content.split('\\n')
				}
				baseInfo = [
					{
						label: '品类',
						name: this.ifEmpty(videoInfo.categroy_name)
					},
					{
						label: '模特',
						name: videoInfo.is_model ? '有' : '无'
					},
					{
						label: '平台',
						name: this.ifEmpty(videoInfo.platform_name)
					},
					{
						label: '场景',
						name: this.ifEmpty(videoInfo.sence)
					},
					{
						label: '栏目',
						name: this.ifEmpty(videoInfo.column_name)
					},
					{
						label: '时长',
						name: videoInfo.time || '其他'
					},
					{
						label: '功能',
						name: this.ifEmpty(videoInfo.usage_name)
					},
					{
						label: '视频比例',
						name: videoInfo.scale_id || ''
					}
				];

				if (!!infos[1].data.result && infos[1].data.result.length !== 0) {
					isFav = true;
				}

				this.setData({
					pageShow: true,
					pageErr: false,
					video,
					baseInfo,
					isFav
				})
				wx.hideLoading()
			}).catch(err => {
				console.log('非讲解、err')
				console.log(err)
				this.setData({
					pageShow: true,
					pageErr: true,
				})
				wx.hideLoading()
			})
		}

		app.query('/api/log', { user_id: app.globalData.openid, video_id: e.video_id, kind: 'browse'}, 'POST').then(res => {
			console.log('日志记录成功')
		})
	},

	onReady() {
		this.videoContext = wx.createVideoContext('videoPlayer')
	},

	onReachBottom: function () {

	},

	onShareAppMessage: function () {

	}
})