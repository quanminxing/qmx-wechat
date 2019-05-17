// pages/orders/orders.js
const app = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		onload: true,
		pay: true,  // 快速重复点击付款限制
		click: true,  // 快速重复点击订单nav限制
		pageShow: false,
		pageErr: false,
		queryData: {
			_search: false,
			pageSize: 20,
			pageNum: 1,
			trade_status: ''
		},
		nav: [
			{
				trade_status: '',
				label: '全部',
			},
			{
				trade_status: '进行中',
				label: '进行中',
			},
			{
				trade_status: '待付款',
				label: '待付款',
			},
			{
				trade_status: '待寄送',
				label: '待寄送',
			},
			{
				trade_status: '待确认',
				label: '待确认',
			},
			{
				trade_status: '交易成功',
				label: '已完成',
			},
			{
				trade_status: '退款中,退款完成,交易关闭',
				label: '退款/售后',
			}
		],
		orders: []
	},

	// 点击订单 nav
	selectNav(e) {
		if(!this.data.clcik) return
		this.data.clcik = false
		console.log(e)
		let trade_status = e.currentTarget.dataset.trade_status;
		if (!trade_status) {
			this.data.queryData._search = false;
			this.data.queryData.trade_status = ''
		} else {
			this.data.queryData._search = true;
			this.data.queryData.trade_status = trade_status;
			
		}
		this.data.queryData.pageNum = 1;
		this.data.orders = [];
		this.queryOrders();
	},

	// 点击去付款
	toPay(e) {
		console.log('点击支付')
		if(!this.data.pay) return
		console.log('可以支付')
		this.data.pay = false
		let payData = {
			openid: app.globalData.openid,
			bill_id: e.currentTarget.dataset.bill_id
		}
		console.log('支付请求信息payData')
		console.log(payData)
		app.query('/api/pay/prepay', payData, 'POST').then(res => {
			console.log('支付返回res')
			console.log(res)
			let data = res.data.data;
			let payData = {
				timeStamp: data.timeStamp + '',
				nonceStr: data.nonceStr,
				package: data.package,
				signType: data.signType,
				paySign: data.paySign,
			}
			console.log(payData)
			wx.requestPayment({
				timeStamp: data.timeStamp + '',
				nonceStr: data.nonceStr,
				package: data.package,
				signType: data.signType,
				paySign: data.paySign,
				success: res => {
					this.data.pay = true
					console.log(res)
					console.log('支付成功')
				},
				fail: err => {
					this.data.pay = true
					console.log(err)
					console.log('支付失败')
				}
			})
		}).catch(err => {
			this.data.pay = true
		})
	},

	// 待寄送 样品  和  待确认  样片
	handleText(text) {
		if(text === '待寄送') return '待寄送样品'
		if(text === '待确认') return '待确认样片'
		 return text
	},

	// 订单数据请求
	queryOrders() {
		app.loading();
		console.log('订单数据请求data')
		console.log(this.data.queryData)
		return new Promise((resolve, reject) => {
			app.query('/api/bill/listByUser', this.data.queryData).then(res => {
				console.log('订单数据(成功)')
				console.log(res)
				let data = res.data.data.map(item => {
					return {
						id: item.id,
						order_id: item.order_id,
						video_id: item.video_id,
						trade_status: this.handleText(item.trade_status),
						price: item.price,
						video_name: item.video_name,
						category_id: item.category_id || 0,
						classify_id: item.classify_id || 0,
						is_model: item.is_model ? '有' : '无',
						sence: item.sence || '其他',
						video_time: item.video_time || '其他',
						usage_name: item.usage_name || '其他',
						short_image: item.short_image,
					}
				})
				console.log(data)
				console.log(this.data.orders)
				this.data.orders.push(...data)
				console.log(this.data.orders)
				this.setData({
					orders: this.data.orders,
					queryData: this.data.queryData
				})
				resolve();
				setTimeout(() => {
					this.data.clcik = true
					wx.hideLoading();
				}, 100)
			}).catch(err => {
				console.log('订单数据(失败)')
				console.log(err)
				reject()
				setTimeout(() => {
					this.data.clcik = true
					wx.hideLoading();
				}, 100)
			})
		})
		
	},

	// 请求出错重载
	reload() {
		console.log('重载')
		this.queryOrders().then(() => {
			this.setData({
				pageShow: true,
				pageErr: false,
			})
		}).catch(() => {
			this.setData({
				pageShow: true,
				pageErr: true,
			})
		});
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {
		this.data.onload = false;
		console.log(e)
		if (!!e.trade_status) {
			
			this.data.queryData._search = true;
			this.data.queryData.trade_status = e.trade_status;
		} else {
			console.log('全部订单')
			this.data.queryData._search = false;
			this.data.queryData.trade_status = ''
		}

		// this.data.queryData.pageNum = 1;
		// this.data.orders = [];

		// const queryData = () => {
		// 	this.data.queryData.user_id = app.globalData.openid;
		// 	console.log('请求订单列表 onload ')
		// 	this.queryOrders().then(() => {
				
		// 		this.setData({
		// 			pageShow: true,
		// 			pageErr: false,
		// 		})
		// 	}).catch(() => {
		// 		this.setData({
		// 			pageShow: true,
		// 			pageErr: true,
		// 		})
		// 	});
		// }
		// console.log(queryData)

		// console.log(app.globalData)
		// if(!app.globalData.openid) {
		// 	console.log('99999999')
		// 	app.loginCallback = () => {
		// 		queryData();
		// 	}
		// } else {
		// 	console.log('88888888888888')
		// 	queryData();
		// }
		
	},

	onShow: function() {
		this.data.queryData.pageNum = 1;
		this.data.orders = [];
		// this.queryOrders();

		const queryData = () => {
			this.data.queryData.user_id = app.globalData.openid;
			console.log('请求订单列表 onload ')
			this.queryOrders().then(() => {

				this.setData({
					pageShow: true,
					pageErr: false,
				})
			}).catch(() => {
				this.setData({
					pageShow: true,
					pageErr: true,
				})
			});
		}
		console.log(queryData)

		console.log(app.globalData)
		if (!app.globalData.openid) {
			console.log('99999999')
			app.loginCallback = () => {
				queryData();
			}
		} else {
			console.log('88888888888888')
			queryData();
		}
		
	},

	onReachBottom: function () {
		++this.data.queryData.pageNum;
		console.log('分页')
		this.queryOrders().then();
	},

	onShareAppMessage: function () {

	}
})