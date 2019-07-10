// pages/orders/orders.js
const app = getApp();

Page({

	data: {
		onload: true,
		click: true,  // 快速重复点击订单nav限制
		pageShow: false,
		pageErr: false,
		sideNav: {
			fold: true,
			nav: [
				{
					icon: '../../images/home_press-black.png',
					label: '首页',
					classname: 'nav-item1',
					url: '/pages/find/index'
				},
				{
					icon: '../../images/dsp_press-black.png',
					label: '样片库',
					classname: 'nav-item2',
					url: '/pages/videos/videos'
				}, {
					icon: '../../images/wd_press-black.png',
					label: '我的',
					classname: 'nav-item3',
					url: '/pages/account/index'
				}
			]
		},
		queryData: {
			_search: false,
			pageSize: 20,
			pageNum: 1,
			trade_status: ''
		},
		nav: [
			{
				index: 0,
				trade_status: '',
				label: '全部',
			},
			{
				index: 1,
				trade_status: '进行中',
				label: '进行中',
			},
			{
				index: 2,
				trade_status: '待付款',
				label: '待付款',
			},
			{
				index: 3,
				trade_status: '待寄送',
				label: '待寄送',
			},
			{
				index: 4,
				trade_status: '待确认',
				label: '待确认',
			},
			{
				index: 5,
				trade_status: '交易成功',
				label: '已完成',
			},
			{
				index: 6,
				trade_status: '退款中,退款完成,交易关闭',
				label: '售后',
			}
		],
		navCurrent: 0,
		multipleItems: 4,
		orders: [],
		payment: {},
		paymentWay: false
	},

	// 子导航
	sideNavToggle() {
		this.setData({
			'sideNav.fold': !this.data.sideNav.fold
		})
	},
	sideNavHide() {
		this.setData({
			'sideNav.fold': true
		})
	},

	// 点击订单 nav
	selectNav(e) {
		if (!this.data.click) return
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
		wx.pageScrollTo({
			scrollTop: 0,
			duration: 0
		})
	},

// 点击去付款，显示付款方式
	showPaymentWays(e) {
		console.log('去付款')
		let paymentInfo = e.currentTarget.dataset
		this.setData({
			payment: {
				order_id: paymentInfo.order_id,
				sale_status: paymentInfo.sale_status,
				pay_type: paymentInfo.pay_type,
				pay_price: paymentInfo.pay_price
			},
			paymentWay: true
		})
	},
	hidePaymentWays() {
		this.setData({
			paymentWay: false
		})
	},

	// 选定支付方式并支付
	toPay(e) {
		const payment = {
			wechat: () => {  // 微信支付
				let payData = {
					openid: app.globalData.openid,
					bill_id: this.data.payment.order_id,
					pay_type: this.data.payment.sale_status.slice(-2)
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
							console.log(res)
							console.log('支付成功')
						},
						fail: err => {
							console.log(err)
							console.log('支付失败')
						}
					})
				}).catch(err => {
				})
			},
			voucher: () => {  // 对公付款
				let payment = this.data.payment
				console.log(payment)
				wx.navigateTo({
					url: `../upload_payment/upload_payment?order_id=${payment.order_id}&type=${payment.pay_type}&price=${payment.pay_price}`
				})
			}
		}
		let paymentWay = e.currentTarget.dataset.payment_way;
		if(!!paymentWay) {
			payment[paymentWay]()
			this.hidePaymentWays()
		}
	},

	changNav(e) {
		console.log(e)
		this.setData({
			navCurrent: e.detail.current
		})
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
					let pay_info = !!item.pay_info ? item.pay_info.split(',') : ['', '', ''];
					return {
						id: item.id,
						order_id: item.order_id,
						video_id: item.video_id,
						sale_status: item.sale_status,
						trade_status: item.trade_status,
						price: item.price,
						earnest_price: item.earnest_price || 0,
						tail_price: ((item.price - item.earnest_price) * 1).toFixed(2) || 0,
						video_name: item.video_name,
						category_id: item.category_id || 0,
						classify_id: item.classify_id || 0,
						is_model: item.is_model ? '有' : '无',
						sence: item.sence || '其他',
						video_time: item.video_time || '其他',
						usage_name: item.usage_name || '其他',
						short_image: item.short_image,
						pay_id: pay_info[0],
						pay_type: pay_info[2],
						pay_verify: pay_info[1],
						showRequirement: (item.sale_status === '待沟通' || item.sale_status === '需求沟通中' || item.sale_status === '待支付定金' || item.sale_status === '已支付定金' || item.sale_status === '待支付全款' || item.sale_status === '已支付全款' || item.sale_status === '待寄送样品') ? true : false,
						product_name: item.product_name || '',
						product_url: item.product_url || '',
						product_scale: item.product_scale || ''
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
			let navIndex = e.navCurrent - this.data.multipleItems + 1;
			this.setData({
				navCurrent: navIndex < 0 ? 0 : navIndex
			})
		} else {
			this.data.queryData._search = false;
			this.data.queryData.trade_status = ''
			this.setData({
				navCurrent: 0
			})
		}
		
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