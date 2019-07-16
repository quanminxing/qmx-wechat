const app = getApp();

Page({

	data: {
		pricesList: [],
		tvc: {
			type: 'tvc',
			img: "https://file.qmxpower.com/image/20190419122707.png",
			classify_id: '2',  // 标准模板讲解类
			category_id: ''
		}
	},

	onLoad: function (options) {
		console.log(options)
		wx.setNavigationBarTitle({
			title: options.category_name
		})
		this.setData({
			'tvc.category_id': options.category_id
		})
		let queryData = {
			_search: true,
			category_id: options.category_id,
			classify_id: 2,
			sord: 'asc',
			sidx: 'price'
		}
		console.log(queryData)
		app.query('/api/video', queryData).then(res => {
			console.log('价格页该类目下的模板讲解类视频列表')
			console.log(res)
			let resData = res.data.data
			console.log(resData)
			this.setData({
				pricesList: resData
			})


		}).catch(err => {
			console.log(err)
		})
	},


	onShareAppMessage: function () {

	},
	
})