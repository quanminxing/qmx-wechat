//index.js

let app = getApp()
const { each } = require('../../utils/util.js')

Page({
  data: {
		user: {
			company: ''
		},
    order: [
			{
				trade_status: '待付款',
				icon: '/images/paying.png',
				text: '待付款',
				url: '../orders/orders?trade_status=待付款&navCurrent=2',
				showFlag: true,
				flag: 0
			},
			{
				trade_status: '待确认',
				icon: '/images/confirming.png',
				text: '待确认',
				url: '../orders/orders?trade_status=待确认&navCurrent=4',
				showFlag: true,
				flag: 0
			},
			{
				trade_status: '待寄送',
				icon: '/images/sending.png',
				text: '待寄送',
				url: '../orders/orders?trade_status=待寄送&navCurrent=3',
				showFlag: true,
				flag: 0
			},
			{
				trade_status: '进行中',
				icon: '/images/ongoing.png',
				text: '进行中',
				url: '../orders/orders?trade_status=进行中&navCurrent=1',
				showFlag: true,
				flag: 0
			},
			{
				trade_status: '交易成功',
				icon: '/images/finished.png',
				text: '已完成',
				url: '../orders/orders?trade_status=交易成功&navCurrent=5',
				showFlag: false,
				flag: 0
			},
			{
				trade_status: '退款中,退款完成,交易关闭',
				icon: '/images/after-sale.png',
				text: '售后',
				url: '../orders/orders?trade_status=退款中,退款完成,交易关闭&navCurrent=6',
				showFlag: false,
				flag: 0
			}
		],
		account: [
			{
				text: '我的足迹',
				url: '/pages/my/log'
			},
			{
				text: '我的收藏',
				url: '/pages/my/fav'
			}
		],
		service: [
			{
				text: '意见反馈',
				openType: 'contact',
				url: ''
			},
			{
				text: '联系我们',
				openType: '',
				url: '/pages/account/contact'
			},
			{
				text: '关于我们',
				openType: '',
				url: '/pages/find/business'
			}
		]
  },

	getOrderFlag(num) {
		if(num <= 0) return '';
		if(num > 9) return '9+';

		return num;
	},

  onLoad: function (e) {
		console.log(app)
		console.log(app.globalData.openid)

		app.query('/api/user', { openid: app.globalData.openid }).then(res => {
			console.log(res)
			let user = res.data.rows;
			if(!!user && !!user.company) {
				this.setData({
					'user.company': user.company
				})
			}
		})

  },

	onShow() {
		app.query('/api/bill/count', { user_id: app.globalData.openid }).then(res => {
			console.log('成功')
			let resData = res.data.data;
			let order = this.data.order;

			let afterSale = 0;

			order.forEach(item => {
				item.flag = 0;
				each(resData, function (data) {
					if (data.trade_status === item.trade_status) {
						item.flag = this.getOrderFlag(data.count)

						return false;
					} else if (data.trade_status === '退款中' || data.trade_status === '退款完成' || data.trade_status === '交易关闭') {
						afterSale += data.count;
					}
				}, this)
			})

			order[5].flag = this.getOrderFlag(afterSale);

			this.setData({
				order,
			})
		}).catch(err => {
			console.log('出错')
		})

		app.query('/api/user', { openid: app.globalData.openid }).then(res => {
			console.log(res)
			let user = res.data.rows;
			if (!!user && !!user.company) {
				this.setData({
					'user.company': user.company
				})
			}
		})
	},

	onShareAppMessage: function () {

	}
})
