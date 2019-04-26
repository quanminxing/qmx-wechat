// pages/detail/detail.js
const app = getApp();
let video_id = null;
let _search = {
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
		sample: []
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
		this.onLoad({ video_id: video_id })
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {
		video_id = e.video_id;
		let videoInfo = app.query('/api/video', { _search: true, id: video_id });
		// let regard = app.query('/api/info/regard')

		Promise.all([videoInfo]).then(infos => {
			console.log(infos)
			let video = {}
			let baseInfo = [];
			let sample = [];

			video = {
				regard: '1、对对对对对对多多多多多多多；2、靠靠靠靠靠靠靠；3、KKK靠靠狂多多多多多'.split(/\d、/)
				// regard: infos[1].data.data.split(/\d、/)
			}

			let data = infos[0].data.data[0];
			video = {
				id: data.id,
				url: data.url,
				name: data.name,
				price: data.price,
				script_url: data.script_url
			}
			if (data.classify_id == 2) {
				let platforms = app.query('/platform');
				platforms = app.query('/platform');
				let samples = app.query('/api/video', { _search: true, related_id: data.related_id })
				Promise.all([platforms, categorys, samples]).then(values => {
					console.log(values)
					baseInfo = [
						{
							label: '适用平台',
							name: suitType(data.platform,values[0].data.rows) || '其他'
						},
						{
							label: '适用品类',
							name: suitType(data.category, values[1].data.rows) || '其他'
						},
						{
							label: '时长',
							name: data.time || ''
						}
					]
					sample = values[2].data.data.map(item => {
						return {
							id: item.id,
							name: item.name,
							waterfall_image: item.waterfall_image,
							price: item.price
						}
					})

					this.setData({
						pageShow: true,
						pageErr: false,
						video,
						baseInfo,
						sample
					})
				})

			} else {
				baseInfo = [
					{
						name: '品类',
						label: this.ifEmpty(data.categroy_name)
					},
					{
						name: '模特',
						label: data.is_model ? '无' : '有'
					},
					{
						name: '平台',
						label: this.ifEmpty(data.platform_name)
					},
					{
						name: '场景',
						label: this.ifEmpty(data.sence)
					},
					{
						name: '栏目',
						label: this.ifEmpty(data.column_name)
					},
					{
						name: '时长',
						label: data.time || ''
					},
					{
						name: '功能',
						label: this.ifEmpty(data.usage_name)
					},
					{
						name: '视频比例',
						label: data.scale_id || ''
					}
				];

				this.setData({
					pageShow: true,
					pageErr: false,
					video,
					baseInfo,
					sample
				})
			}

		}).catch(err => {
			console.log(err)
			this.setData({
				pageShow: true,
				pageErr: true,
			})
		})

		// app.query('/api/video', { _search: true, id: video_id }).then(res => {
		// 	console.log(res)
		// 	let data = res.data.data;
		// 	let baseInfo = [];
		// 	let sample = [];
		// 	let video = {
		// 		id: data.id,
		// 		url: data.url,
		// 		name: data.name,
		// 		price: data.price,
		// 		script_url: data.script_url
		// 	}
		// 	if (data.classify_id == 2) {
		// 		let platforms = app.query('/platform');
		// 		platforms = app.query('/platform');
		// 		let samples = app.query('/api/video', { _search: true, related_id: data.related_id })
		// 		Promise.all([platforms, categorys, samples]).then(values => {
		// 			baseInfo = [
		// 				{
		// 					label: '适用平台',
		// 					name: suitType(data.platform,values[0].data.rows) || '其他'
		// 				},
		// 				{
		// 					label: '适用品类',
		// 					name: suitType(data.category, values[1].data.rows) || '其他'
		// 				},
		// 				{
		// 					label: '时长',
		// 					name: data.time || ''
		// 				}
		// 			]
		// 			sample = values[2].data.data.map(item => {
		// 				return {
		// 					id: item.id,
		// 					name: item.name,
		// 					waterfall_image: item.waterfall_image,
		// 					price: item.price
		// 				}
		// 			})
		// 		})

		// 	} else {
		// 		baseInfo = [
		// 			{
		// 				name: '品类',
		// 				label: ifEmpty(data.categroy_name)
		// 			},
		// 			{
		// 				name: '模特',
		// 				label: data.is_model ? '无' : '有'
		// 			},
		// 			{
		// 				name: '平台',
		// 				label: ifEmpty(data.platform_name)
		// 			},
		// 			{
		// 				name: '场景',
		// 				label: ifEmpty(data.sence)
		// 			},
		// 			{
		// 				name: '栏目',
		// 				label: ifEmpty(data.column_name)
		// 			},
		// 			{
		// 				name: '时长',
		// 				label: data.time || ''
		// 			},
		// 			{
		// 				name: '功能',
		// 				label: ifEmpty(data.usage_name)
		// 			},
		// 			{
		// 				name: '视频比例',
		// 				label: data.scale_id || ''
		// 			}
		// 		]
		// 	}

		// }).catch(err => {
		// 	this.setData
		// })
	},

	onReachBottom: function () {

	},

	onShareAppMessage: function () {

	}
})