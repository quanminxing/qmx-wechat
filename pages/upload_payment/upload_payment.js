// pages/upload_payment/upload_payment.js
const { uploadImgs } = require('../../utils/uploadImgs')
const { uploadFiles } = require('../../utils/uploadFile')

const app = getApp();

Page({

	data: {
		payment: {
			order_id: '',
			type: '',
			price: '',
			voucher: ''
		},
		submit: false
	},

	onLoad: function (e) {
		console.log(e)
		this.setData({
			payment: {
				order_id: e.order_id,
				type: e.type || '全款',
				price: e.price,
				voucher: ''
			}
		})
	},

	uploadVoucher() {
		uploadImgs().then(res => {
			this.setData({
				'payment.voucher': res.data.urls[0],
				submit: true
			})
		}).catch(err => {
			
		})
	},

	copyPayment(e) {
		let info = e.currentTarget.dataset.info;

		wx.setClipboardData({
			data: info,
			success: () => {
				app.showToast({ title: '复制成功' })
			}
		})
	},

	previewGraph(e) {
		console.log(e)
		let imgUrl = e.currentTarget.dataset.img;
		wx.previewImage({
			urls: [imgUrl],
			current: imgUrl
		})
	},

	submitVoucher() {
		if (!this.data.submit) return

		let payment = this.data.payment;
		let queryData = {
			bill_id: payment.order_id,
			voucher: payment.voucher,
			pay_type: payment.type || '全款'
		}

		this.setData({
			submit: false
		})
		app.loading('提交中，请稍后')
		console.log(queryData)
		app.query('/api/pay/payByBank', queryData, 'POST').then(res => {
			wx.hideLoading()
			this.setData({
				submit: true
			})
			wx.showModal({
				title: '提交成功',
				content: '请耐心等待审核结果',
				showCancel: false,
				success: (res) => {
					if(res.confirm) {
						wx.navigateTo({
							url: '../orders/orders',
						})
					}
				}
			})
		}).catch(err => {
			console.log(err)
			wx.hideLoading()
			this.setData({
				submit: true
			})
			if (err.statusCode === 200 && err.data.status === 500) {
				wx.showModal({
					title: '提示',
					content: err.data.err_message,
					showCancel: false,
					success: () => {
						wx.navigateTo({
							url: `../order_detail/order_detail?order_id=${this.data.payment.order_id}`,
						})
					}
				})
			} else {
				
				app.showToast({ title: '网络异常，请检查后再试', icon: 'none' })
			}
		})
	}

})