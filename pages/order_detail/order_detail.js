// pages/order_detail/orders_detail.js

const { each, formatTime } = require('../../utils/util.js')

const app = getApp();

Page({

	data: {
		pageShow: false,
		pageErr: false,
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

	// 点击去付款
	toPay(e) {
		console.log('点击支付')
		if (!this.data.pay) return
		console.log('可以支付')
		this.data.pay = false
		let payData = {
			openid: app.globalData.openid,
			bill_id: e.currentTarget.dataset.bill_id,
			pay_type: e.currentTarget.dataset.settle.slice(-2)
		}
		console.log('支付请求信息payData')
		console.log(payData)
		app.query('/api/pay/prepay', payData, 'POST').then(res => {
			console.log('支付返回res')
			console.log(res)
			let data = res.data.data;
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
			console.log(err)
			console.log('支付失败')
			this.data.pay = true
		})
	},

	getPrice(price) {
		let p = price * 1;
		if (!!p) return '￥' + p.toFixed(2)
		return ''
	},

	// 获取订单数据
	getOrderData(queryData) {
		return new Promise((resolve, reject) => {
			app.query('/api/bill/detail', queryData).then(res => {
				
				let details = res.data.data;
				let send = this.data.send;
				let reserve = this.data.reserve;
				let order = this.data.order;
				let refund = this.data.refund;
				let video = this.data.video;
				console.log(details)
				send.forEach(item => {
					item.value = details[item.key] || item.value
				})

				reserve.forEach(item => {
					item.value = details[item.key] || item.value
				})

				order.forEach(item => {
					item.value = item.key.search(/price/) > -1 ? this.getPrice(details[item.key]) : details[item.key];
					if(details.pay_info) {
						let payInfo = details.pay_info;
						payInfo.forEach(payItem => {
							if(item.key === payItem.type) {
								item.value = formatTime(new Date(payItem.end_time))
							}
						})
					}
				})
				let pay_status = details.pay_status;
				order[3].tip = ''
				order[4].tip = ''
				order[5].tip = ''
				if (details.settle_status === '定金+尾款') {
					order[5].value = this.getPrice(details.price - details.earnest_price);
					if (pay_status === '待付款' || pay_status === '未付款') {
						order[4].tip = '未支付'
						order[5].tip = '未支付'
					} else if (pay_status === '已支付定金') {
						order[5].tip = '未支付'
					}
				} else {
					if (pay_status === '待付款' || pay_status === '未付款') {
						order[3].tip = '未支付'
					}
				} 

				refund.forEach(item => {
					if (item.key.search(/price/) > -1) {
						item.value = this.getPrice(details[item.key])
					} else {
						item.value = details[item.key] || ''
					}
				})

				let payInfo = details.pay_info
				payInfo.forEach(item => {
					if (item.pay_type === '定金') {
						order[8].value = item.pay_time || ''
					} else if (item.pay_type === '尾款') {
						order[9].value = item.pay_time || ''
					}
				})

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
						tail_price: ((details.price - details.earnest_price) * 1).toFixed(2) || ''
					},
					send,
					reserve,
					order,
					refund,
					video,
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