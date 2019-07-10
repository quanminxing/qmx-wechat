// pages/order_verify/order_verify.js

const app = getApp();

Page({

	data: {
		verify: {
			pay_id: '',
			verify: '',
			verify_info: '',
			type: '',
			price: '',
			voucher: ''
		}
	},

	onLoad: function (e) {
		app.query('/api/pay/listById', { pay_id: e.pay_id}).then(res => {
			let data = res.data.data;
			console.log(data)
			this.setData({
				verify: {
					pay_id: data.id, 
					order_id: e.order_id,
					verify: data.verify,
					verify_info: data.verify_info,
					type: data.type,
					price: data.price,
					voucher: data.voucher
				}
			})
		}).catch(err => {})
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

})