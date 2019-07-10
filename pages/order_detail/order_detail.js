// pages/order_detail/orders_detail.js

const { each, formatTime } = require('../../utils/util.js')

const app = getApp();

Page({

	data: {
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
		detail: {
			id: null,
			sale_status: '',
			trade_status: '',
			settle_status: '',
			price: '',
			earnest_price: ''
		},
		send: [
			{
				icon: '/images/address.png',
				key: 'address',
				value: '浙江省杭州市余杭区仓前街道海智中心4幢7楼宜拍短视频'
			},
			{
				icon: '/images/account.png',
				key: 'worker_name',
				value: ''
			},
			{
				icon: '/images/phone.png',
				key: 'worker_phone',
				value: ''
			}
		],
		reserve: [
			{
				key: 'name',
				label: '姓名',
				value: ''
			},
			{
				key: 'phone',
				label: '手机号',
				value: ''
			},
			{
				key: 'email',
				label: '邮箱',
				value: ''
			},
			{
				key: 'business',
				label: '公司名称',
				value: ''
			},
			{
				key: 'comment',
				label: '留言',
				value: ''
			}
		],
		requirement: [
			{
				key: 'product_name',
				label: '宝贝名称',
				value: ''
			}, {
				key: 'product_url',
				label: '宝贝链接',
				value: ''
			}, {
				key: 'product_scale',
				label: '视频比例',
				value: ''
			}
		],
		showRequirement: true,
		video: {
			short_image: '',
			video_name: '',
			is_model: '',
			sence: '',
			video_time: '',
			usage_name: '',
			category_id: '',
			video_id: '',
			classify_id: ''
		},
		order: [
			{
				label: '订单编号',
				key: 'order_id',
				value: ''
			},
			{
				label: '结算方式',
				key: 'settle_status',
				value: ''
			},
			{
				label: '支付状态',
				key: 'pay_status',
				value: ''
			},
			{
				label: '订单价格',
				key: 'price',
				value: '',
				tip: ''
			},
			{
				label: '定金',
				key: 'earnest_price',
				value: '',
				tip: ''
			},
			{
				label: '尾款',
				key: 'tail_price',
				value: '',
				tip: ''
			},
			{
				label: '下单时间',
				key: 'order_time',
				value: ''
			},
			{
				label: '付款时间',
				key: '全款',
				value: ''
			},
			{
				label: '定金付款时间',
				key: '定金',
				value: ''
			},
			{
				label: '尾款付款时间',
				key: '尾款',
				value: ''
			}
		],
		refund: [
			{
				label: '退款金额',
				key: 'refund_price',
				value: ''
			},
			{
				label: '退款时间',
				key: 'refund_time',
				value: ''
			}
		],
		regard: [],
		pay: true,  // 控制重复点击付款
		latestPayment: {},
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

	// 修改预留信息
	modifyReserve() {
		app.globalData.reserve = {
			data: this.data.reserve,
			id: this.data.detail.id
		}
		wx.navigateTo({
			url: '../reserve_modify/reserve_modify'
		})
	},

	// 点击去付款，显示付款方式
	showPaymentWays(e) {
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
				let payment = this.data.payment;
				console.log(payment)
				wx.navigateTo({
					url: `../upload_payment/upload_payment?order_id=${payment.order_id}&type=${payment.pay_type}&price=${payment.pay_price}`
				})
			}
		}
		let paymentWay = e.currentTarget.dataset.payment_way;
		if (!!paymentWay) {
			payment[paymentWay]()
			this.hidePaymentWays()
		}
	},


	getPrice(price) {
		let p = price * 1;
		if (!!p) return '￥' + p.toFixed(2)
		return ''
	},

	// 视频比例label提示
	getScaleLabel(scale) {
		const scaleLabel = {
			'16:9': '(横版)',
			'16：9': '(横版)',
			'3:4': '(竖版)',
			'3：4': '(竖版)',
			'1:1': '(方形)', 
			'1：1': '(方形)',
			'9:16': '(竖版)',
			'9：16': '(竖版)'
		}

		return scaleLabel[scale]
	},

	// 获取订单数据
	getOrderData(queryData) {
		return new Promise((resolve, reject) => {
			app.query('/api/bill/detail', queryData).then(res => {
				
				let details = res.data.data;
				let send = this.data.send;
				let reserve = this.data.reserve;
				let requirement = this.data.requirement;
				let order = this.data.order;
				let refund = this.data.refund;
				let video = this.data.video;
				console.log(details)

				send.forEach(item => {
					if (item.key === 'address') return
					item.value = details[item.key] || ''
				})

				reserve.forEach(item => {
					item.value = details[item.key] || ''
					
				})

				requirement.forEach(item => {
					item.value = details[item.key] || '';
					if (item.key === 'product_scale' && !!item.value) {
						item.value += this.getScaleLabel(item.value)
					}
				})

				if (details.settle_status === '全款') {
					order[3].tip = '未支付'
				} else {
					order[4].tip = '未支付'
					order[5].tip = '未支付'
				}
				order.forEach((item, index) => {
					let payInfo = details.pay_info;

					item.value = item.key.search(/price/) > -1 ? this.getPrice(details[item.key]) : (details[item.key] || '');
					
					if (index >= 7 && payInfo.length > 0) {
						payInfo.forEach(payItem => {
							if (!!payItem.end_time && payItem.type === item.key) {
								item.value = payItem.end_time;
								if (payItem.type === '全款') {
									order[3].tip = ''
								} else if (payItem.type === '定金') {
									order[4].tip = ''
								} else if (payItem.type === '尾款') {
									order[5].tip = ''
								}
							}
						})
					}
				})
				let tail_price = ((details.price - details.earnest_price) * 1).toFixed(2) || ''
				order[5].value = details.settle_status === '定金+尾款' ? '￥' +tail_price : '';

				refund.forEach(item => {
					if (item.key.search(/price/) > -1) {
						item.value = this.getPrice(details[item.key])
					} else {
						item.value = details[item.key] || ''
					}
				})

				let latestPaymentInfo = details.pay_info[0] || {}
				let latestPayment = {
					pay_id: latestPaymentInfo.id || '',
					order_id: details.id || '',
					sale_status: details.sale_status || '',
					pay_type: latestPaymentInfo.type || '',
					pay_verify: latestPaymentInfo.verify || ''
				}

				for (let key in video) {
					video[key] = details[key]
				}

				this.setData({
					detail: {
						id: details.id,
						sale_status: details.sale_status,
						trade_status: details.trade_status,
						settle_status: details.settle_status,
						price: details.price,
						earnest_price: details.earnest_price || '',
						tail_price,
					},
					send,
					reserve,
					requirement,
					showRequirement: (details.sale_status === '待沟通' || details.sale_status === '需求沟通中' || details.sale_status === '待支付定金' || details.sale_status === '已支付定金' || details.sale_status === '待支付全款' || details.sale_status === '已支付全款' || details.sale_status === '待寄送样品') ? true : false,
					order,
					refund,
					video,
					latestPayment
				})

				resolve();

			}).catch(err => {
				console.log(err)
				console.log('数据请求出错')
				reject();
			})
		})
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {

		console.log(e)
		let id = e.order_id * 1;

		this.data.detail.id = id
		
		app.query('/api/info/regard').then(res => {
			this.setData({
				regard: res.data.data.content.split('\\n')
			})
		}).catch(err => {
			this.setData({
				regard: ['1、下单后30分钟内会有客服联系您填写视频需求表，请将特殊要求及时与客服沟通以确认完整需求。若特殊需求无法通过套餐短视频执行的请选择定制服务，具体可询问客服报价建议。', '2、视频成片在脚本范围内可免费修改一次，脚本范围外的修改请联系客服确认修改报价。']
			})
		});

	},

	onShow: function() {
		this.getOrderData({ id: this.data.detail.id }).then(() => {
			this.setData({
				pageShow: true,
				pageErr: false,
			})
		}).catch(() => {
			this.setData({
				pageShow: true,
				pageErr: true,
			})
		})
	},

})