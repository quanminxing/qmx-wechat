// pages/order_detail/orders_detail.js

const { each } = require('../../utils/util.js')

const app = getApp();

Page({

	data: {
		pageShow: true,
		pageErr: false,
		id: null,
		sale_status: '',
		trade_status: '',
		settle_status: '',
		send: [
			{
				icon: '/images/address.png',
				key: 'address',
				value: '浙江省杭州市余杭区五常街道海智中心4幢7浙江省杭州市余杭区五常街道海智中心4幢'
			},
			{
				icon: '/images/account.png',
				key: 'worker_name',
				value: '浙江省杭州市余杭区'
			},
			{
				icon: '/images/phone.png',
				key: 'worker_phone',
				value: '17816897646'
			}
		],
		reserve: [
			{
				key: 'name',
				label: '联系人',
				value: '矿进口矿进口矿进口矿进口矿进口矿进口矿进口矿进口矿进口矿进口矿进口矿进口矿进口'
			},
			{
				key: 'business',
				label: '公司',
				value: '狂开塞进来范框架啃到黄河脑;djfjk'
			},
			{
				key: 'phone',
				label: '联系电话',
				value: '8387余7938847388'
			},
			{
				key: 'email',
				label: '邮箱',
				value: '将靠胆量看就看开老带肯定'
			},
			{
				key: 'comment',
				label: '留言',
				value: '矿洞多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多'
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
				value: '多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多'
			},
			{
				label: '结算方式',
				key: 'settle_status',
				value: '到狂开袋量扩为'
			},
			{
				label: '支付状态',
				key: 'pay_status',
				value: '旷考狂开的'
			},
			{
				label: '订单价格',
				key: 'price',
				value: '￥38837',
				tip: ''
			},
			{
				label: '定金',
				key: 'earnest_price',
				value: '￥889',
				tip: ''
			},
			{
				label: '尾款',
				key: 'tail_price',
				value: '￥97997',
				tip: ''
			},
			{
				label: '下单时间',
				key: 'order_time',
				value: '2019-05-22 23:34:54'
			},
			{
				label: '付款时间',
				key: 'pay_time',
				value: '2019-05-22 23:34:54'
			},
			{
				label: '定金付款时间',
				key: '定金',
				value: '2019-05-22 23:34:54'
			},
			{
				label: '尾款付款时间',
				key: '尾款',
				value: '2019-05-22 23:34:54'
			}
		],
		refund: [
			{
				label: '退款金额',
				key: 'refund_price',
				value: '￥8668'
			},
			{
				label: '退款时间',
				key: 'refund_time',
				value: '2019-05-22 23:45:53'
			}
		],
		regard: [],
		pay: true,  // 控制重复点击付款
	},

	// 修改预留信息
	modifyReserve() {
		app.globalData.reserve = this.data.reserve;
		app.globalData.reserve.id = this.data.id
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
			settle: e.currentTarget.dataset.settle.slice(-2)
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
			this.data.pay = true
		})
	},

	/**
	 * 生命周期函数
	 */
	onLoad: function (e) {

		console.log(e)
		let id = e.order_id;
		let regard = app.query('/api/info/regard');
		let detail = app.query('/api/bill/detail', { id });

		this.setData({
			id,
		})

		Promise.all(detail, regard).then(infos => {
			let details = infos[0].data.data;
			let send = this.data.send;
			let reserve = this.data.reserve;
			let order = this.data.order;
			let refund = this.data.refund;
			let video = this.data.video;

			send.forEach(item => {
				item.value = details[item.key] || item.value
			})

			reserve.forEach(item => {
				item.value = details[item.key] || item.value
			})

			order.forEach(item => {
				item.value = details[item.key] || item.value
			})
			order[5].value = details.price - details.earnest_price || '';
			if (details.trade_status === '待支付') {
				let sale_status = details.sale_statu;
				if (sale_status === '待支付全款') {
					order[3].tip = '未支付'
				} else if (sale_status === '待支付定金') {
					order[4].tip = '未支付'
				} else if (sale_status === '待支付尾款') {
					order[5].tip = '未支付'
				} else {
					order[4].tip = '未支付'
					order[5].tip = '未支付'
				}
			}

			refund.forEach(item => {
				item.value = details[item.key] || item.value
			})

			let payInfo = details.pay_info
			payInfo.forEach(item => {
				if (item.pay_type === '定金') {
					order[8].value = item.pay_time || ''
				} else if (item.pay_type === '尾款') {
					order[9].value = item.pay_time || ''
				}
			})

			for(key in video) {
				video[key] = details[key]
			}
			


			this.data.regard = infos[1].content.split('\\n')
		}).catch(err => {

		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})