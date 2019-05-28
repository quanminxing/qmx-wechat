//index.js

let app = getApp()
const { each } = require('../../utils/util.js')

Page({
  data: {
    order: [
			{
				trade_status: '待付款',
				icon: '/images/paying.png',
				text: '待付款',
				url: '../orders/orders?trade_status=待付款',
				flag: '9+'
			},
			{
				trade_status: '待确认',
				icon: '/images/confirming.png',
				text: '待确认',
				url: '../orders/orders?trade_status=待确认',
				flag: '9'
			},
			{
				trade_status: '待寄送',
				icon: '/images/sending.png',
				text: '待寄送',
				url: '../orders/orders?trade_status=待寄送',
				flag: '5'
			},
			{
				trade_status: '进行中',
				icon: '/images/onging.png',
				text: '进行中',
				url: '../orders/orders?trade_status=进行中',
				flag: '3'
			},
			{
				trade_status: '交易成功',
				icon: '/images/finished.png',
				text: '已完成',
				url: '../orders/orders?trade_status=交易成功',
				flag: ''
			},
			{
				trade_status: '退款中,退款完成,交易关闭',
				icon: '/images/after-sale.png',
				text: '售后/退款',
				url: '../orders/orders?trade_status=退款中,退款完成,交易关闭',
				flag: ''
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
		app.query('/api/bill/count', {}, 'POST').then(res => {
			console.log('成功')
			let resData = res.data.data;
			let order = this.data.order;

			let afterSale = 0;

			order.forEach(item => {
				each(resData, function(data) {
					if (data.trade_status === item.trade_status) {
						item.flag = this.getOrderFlag(data.count)

						return false;
					} else if (data.trade_status === '退款中' || data.trade_status === '退款完成' || data.trade_status === '交易关闭') {
						afterSale += data.count;
					}
				}, this)
			})

			order[5].flag = afterSale;

			this.setData({
				order,
			})
		}).catch(err => {
			console.log('出错')
		})

  },

	onShareAppMessage: function () {

	}
})
