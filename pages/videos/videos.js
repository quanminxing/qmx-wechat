// pages/videos/videos.js
const app = getApp();
let _search = {
	pageNum: 1,
	pageSize: 20,
	_search: true,
	classify_id: '1,3'   // 1,：标准模板客片类；3：定制非TVC类
}

Page({
	data: {
		pageShow: false,
		pageErr: false,
		search: '搜索',
		itemize: [
			{
				show: false,
				name: 'sort',
				className: 'itemize-sort',
				label: '排序',
				icon: '../../images/arrow-bottom.png',
				sub: [
					{
						label: '默认排序',
						sidx: '',
						sord: '',
						selected: false
					},
					{
						sidx: 'price',
						sord: 'asc',
						label: '价格升序',
						selected: false
					},
					{
						sidx: 'price',
						sord: 'desc',
						label: '价格降序',
						selected: false
					}
				]
			}, {
				show: false,
				name: 'category_id',
				className: 'itemize-category',
				label: '品类',
				icon: '../../images/arrow-bottom.png',
				sub: [{
					label: '全部',
					category_id: '',
					alias: '品类',
					selected: false
				}]
			}, {
				show: false,
				name: 'usage_id',
				className: 'itemize-usage',
				label: '功能',
				icon: '../../images/arrow-bottom.png',
				sub: [{
					label: '全部',
					usage_id: '',
					alias: '功能',
					selected: false
				}]
			}
		],
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
					price: item.price
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

		})
	},

	/**
	 * 页面事件函数
	 */
	reload() {
		this.onLoad()
	},

	showItemizeSub(e) {
		let dataset = e.target.dataset;
		let type = dataset.origin;
		if (type === 'itemizeSub') {
			let itemize = this.data.itemize[dataset.itemize];
			let itemizeSub = itemize.sub[dataset.itemizesub];

			itemize.label = itemizeSub.label === '全部' ? itemizeSub.alias : itemizeSub.label
			itemizeSub.selected = true
			itemize.sub.forEach(item => {
				item.selected = false;
			})
			
			if (itemize.name === 'sort') {
				_search.sidx = itemizeSub.sidx;
				_search.sord = itemizeSub.sord
			} else {
				_search[itemize.name] = itemizeSub[itemize.name]
			}
			_search.pageNum = 1;
			this.data.videos = []
			this.queryList().then(() => {
				wx.pageScrollTo({
					scrollTop: 0,
					duration: 0,
					success: () => {
					}
				})
			})
		}

		console.log(_search)

		let index = e.currentTarget.dataset.index;
		let show = `itemize[${index}].show`;
		let icon = `itemize[${index}].icon`;
		let is_show = !this.data.itemize[index].show;
		this.data.itemize.forEach((item, i) => {
			if(i !== index) {
				item.show = false;
				item.icon = '../../images/arrow-bottom.png'
			} else {
				item.show = is_show;
				item.icon = is_show ? '../../images/arrow-top.png' : '../../images/arrow-bottom.png'
			}
		})
		this.setData({
			itemize: this.data.itemize
		})
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function () {
		let category = app.query('/category');
		let usage = app.query('/usage');
		let videos = app.query('/api/video', _search);
		console.log('onload')
		Promise.all([category, usage, videos]).then(datas => {
			console.log(datas)
			let category = datas[0].data.rows;
			let usage = datas[1].data.rows;
			let videos = datas[2].data.data;

			let categorySub = category.map(item => {
				return {
					label: item.name,
					category_id: item.id,
					selected: false
				}
			})
			categorySub.unshift({
				label: '全部',
				category_id: '',
				alias: '品类',
				selected: false
			})
			let usageSub = usage.map(item => {
				return {
					label: item.name,
					usage_id: item.id,
					selected: false
				}
			});
			usageSub.unshift({
				label: '全部',
				usage_id: '',
				alias: '功能',
				selected: false
			})
			let videosData = videos.map(item => {
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
				'itemize[1].sub': categorySub,
				'itemize[2].sub': usageSub,
				videos: videosData
			})
		}).catch(err => {
			console.log(err)
			this.setData({
				pageShow: true,
				pageErr: true,
			})
		})
	},

	onPullDownRefresh: function () {

	},

	onReachBottom: function () {
		_search.pageNum = ++_search.pageNum;
		this.queryList().then(videos => {
			if(videos.length === 0) {
				console.log('没有更多了哦')
			}
		})
	},

	onShareAppMessage: function () {

	}
})