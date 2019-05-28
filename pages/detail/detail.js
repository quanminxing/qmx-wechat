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
		isFav: false,
		showShare: false,
		poster: {
			img: '',
			qrCode: '',
			video_id: '',
			classify_id: ''
		},
		showPoster: false,
		posterSuccess: false,
		isScroll: true
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

	showShare() {
		console.log('share')
		this.setData({
			showShare: true
		})
	},
	hideshare() {
		this.setData({
			showShare: false
		})
	},

	creatPoster() {
		this.setData({
			showShare: false,
			showPoster: true
		})
		app.loading('生成中，请稍后')

		let video = this.data.video;
		let posterInfo = {
			title: video.name,
			category: '#' + video.categroy_name,
			time: video.time
		}

		console.log('二维码video信息')
		console.log(video)

		let getCode = new Promise((resolve, reject) => {
			app.query('/api/share/getacode', { scene: `video_id:${video.id},classify_id:${video.classify_id}`, width: 1280, page: 'pages/detail/detail' }, 'POST', 'arraybuffer').then(res => {
				console.log(res)
				const filePath = `${wx.env.USER_DATA_PATH}/qrcode${new Date().getTime()}.jpg`
				const fsm = wx.getFileSystemManager();
				console.log(filePath)
				fsm.writeFile({
					filePath,
					data: res.data,
					encoding: 'utf8',
					success: res => {
						console.log(res)
						wx.getImageInfo({
							src: filePath,
							success: res => {
								console.log(res)
								resolve(res.path)
							}
						})
					},
					fail: err => {
						console.log(err)
						reject(err)
					}
				})
			})
		})
		let getImg = new Promise(resolve => {
			wx.getImageInfo({
				src: this.data.video.short_image,
				success: res => {
					console.log(res)
					console.log('success')
					resolve(res.path)
				}
			})
		})

		const that = this

		const drawPoster = function (ratio, img, qrCode, info) {
			console.log('开始画canvas')
			console.log(ratio)
			console.log(img)
			console.log(qrCode)
			console.log(info)
			const poster = wx.createCanvasContext('friends-poster');

			poster.fillStyle = '#ffffff'
			poster.fillRect(0, 0, 622 / ratio, 690 / ratio);
			
			// 视频图片和二维码
			poster.drawImage(img, 0, 0, 622 / ratio, 350 / ratio)
			poster.drawImage(qrCode, 456 / ratio, 502 / ratio, 140 / ratio, 140 / ratio)

			// 视频信息
			poster.setFillStyle('#353535');
			poster.setFontSize(18)
			poster.fillText(info.title, 26 / ratio, 410 / ratio, 560 / ratio)

			poster.setFillStyle('#999');
			poster.setFontSize(10)
			poster.fillText(info.category + ' / ' + info.time, 26 / ratio, 450 / ratio, 560 / ratio)

			poster.setFillStyle('#666');
			poster.setFontSize(13)
			poster.fillText('拍视频，找宜拍', 26 / ratio, 640 / ratio)

			poster.setFillStyle('#999');
			poster.setFontSize(10)
			poster.fillText('长 观', 394 / ratio, 519 / ratio)
			poster.fillText('按 看', 394 / ratio, 543 / ratio)
			poster.fillText('小 当', 394 / ratio, 565 / ratio)
			poster.fillText('程 前', 394 / ratio, 589 / ratio)
			poster.fillText('序 视', 394 / ratio, 613 / ratio)
			poster.fillText('码 频', 394 / ratio, 637 / ratio)

			poster.draw()
			setTimeout(() => {
				that.setData({
					posterSuccess: true,
					isScroll: false
				})
				wx.hideLoading()
			}, 100)
			
		}

		Promise.all([getImg, getCode]).then(infos => {
			console.log(infos)
			let img = infos[0];
			let qrCode = infos[1];

			const ratio = app.globalData.ratio;
			if (!ratio) {
				console.log('ratio')
				wx.getSystemInfo({
					success: res => {
						console.log(res)
						let ratio = 750 / res.screenWidth;
						app.globalData.ratio = ratio
						drawPoster(ratio, img, qrCode, posterInfo)
					}
				})
			} else {
				drawPoster(ratio, img, qrCode, posterInfo);
			}
		}).catch(err => {
			console.log(err)
		})
		
	},

	saveposter() {
		let ratio = app.globalData.ratio;

		wx.canvasToTempFilePath({
			canvasId: 'friends-poster',
			x: 0,
			y: 0,
			width: 622 / ratio,
			height: 690 / ratio,
			destWidth: 622 * 3 / ratio,
			destHeight: 690 * 3 / ratio,
			success: res => {
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: res => {
						console.log('保存成功')
						console.log(res)
						this.hidePoster();
						app.showToast({
							title: '海报已经保存到相册，快去分享吧',
							icon: 'none',
							mask: true
						}, 2000)
					},
					fail: err => {
						console.log('保存失败')
						console.log(err)
						wx.showModal({
							title: '没有相册权限，请开启权限',
							content: '点击右上角【 · · · 】→ 点击【 关于宜拍短视频工厂 】→ 再次点击右上角【 · · · 】 → 点击【 设置 】→ 开启【 相册 】权限',
							showCancel: false
						})
					}
				})
			}
		}, this)
	},

	hidePoster() {
		this.setData({
			showPoster: false,
			posterSuccess: false,
			isScroll: true
		})
	},


	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {
		
		console.log('参数参数参数参数参数参数')
		console.log(e)
		console.log(!!e.scene)
		app.loading();

		if(!!e.scene) {
			console.log('海报海报海报海报海报海报海报')
			console.log(decodeURIComponent(e.scene))
			let scene = decodeURIComponent(e.scene).split(',').forEach(item => {
				let param = item.split(':')
				event[param[0]] = param[1]
			})
			console.log(event)
		} else {
			event = {
				video_id: e.video_id,
				classify_id: e.classify_id
			}
		}
		
		sample_search.pageNum = 1;
		
		let videoInfo = app.query('/api/video', { _search: true, id: event.video_id });
		let regard = app.query('/api/info/regard')
		let fav = app.query('/api/fav/findByUser', { openid: app.globalData.openid, id: event.video_id})
		let video = {};
		let baseInfo = [];
		let sample = [];
		let isFav = false;
		let sampleMore = true;


		if(event.classify_id == 2) {  // 讲解类视频
			sample_search.related_id = event.video_id;
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
					regard: infos[5].data.data.content.split('\\n'),
					short_image: videoInfo.short_image,
					categroy_name: videoInfo.categroy_name || '其他',
					time: videoInfo.time || '其他'
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
					regard: infos[2].data.data.content.split('\\n'),
					short_image: videoInfo.short_image,
					categroy_name: videoInfo.categroy_name || '其他',
					time: videoInfo.time || '其他'
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

		app.query('/api/log', { user_id: app.globalData.openid, video_id: event.video_id, kind: 'browse'}, 'POST').then(res => {
			console.log('日志记录成功')
		})

	},

	onReady() {
		this.videoContext = wx.createVideoContext('videoPlayer')
	},

	onReachBottom: function () {

	},

	onShareAppMessage: function () {
		this.hideshare()
	}
})