// pages/requirement/requirement.js
const { each } = require('../../utils/util.js');

const app =getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		test: '',
		requirement: {
			bill_id: '',
			product_name: '',
			product_url: '',
			product_scale: ''
		},
		scale: [
			{
				label: '16:9(横版)',
				value: '16:9',
				icon: '../../images/scale169.png',
				selected: false
			}, {
				label: '1:1(方形)',
				value: '1:1',
				icon: '../../images/scale11.png',
				selected: false
			}, {
				label: '3:4(竖版)',
				value: '3:4',
				icon: '../../images/scale34.png',
				selected: false
			}, {
				label: '9:16(竖版)',
				value: '9:16',
				icon: '../../images/scale916.png',
				selected: false
			}
		],
		tips: [
			'1、手机淘宝、天猫：打开商品详情页，分享 -> 复制链接，将淘口令粘贴至小程序“宝贝链接”输入框。',
			'2、手机京东、拼多多等：打开商品详情页，分享 -> 复制链接，将商品链接粘贴至小程序“宝贝链接”输入框。',
			'3、电脑端：打开商品详情页复制浏览器地址栏中的链接，发送微信消息到手机微信，再将链接粘贴至小程序“宝贝链接”输入框。',
			'4、若宝贝尚未上架售卖，无宝贝链接，请在宝贝链接输入框内填写“未上架”。'
		],
		viewMore: false,
		submit: true
	},

	getInout(e) {
		console.log(e)
		let key = `requirement.${e.currentTarget.dataset.key}`;
		this.setData({
			[key]: e.detail.value
		})
	},

	selectScale(e) {
		console.log(e)
		let selectedIndex = e.currentTarget.dataset.index

		this.data.scale.forEach((item, index) => {
			if (selectedIndex == index) {
				item.selected = true;
				this.data.requirement.product_scale = item.value;
			} else {
				item.selected = false
			}
		})

		this.setData({
			'requirement.product_scale': this.data.requirement.product_scale,
			scale: this.data.scale
		})
	},

	viewMoreTips() {
		this.setData({
			viewMore: true
		})
	},

	submitRequirement() {
		if(!this.data.submit) return


		let submitData = {};
		let submit = true;
		const showTips = function (content) {
			wx.showModal({
				title: '提示',
				content,
				showCancel: false
			})
		}
		const tips = {
			product_name: () => {
				showTips('请填写宝贝名称')
			},
			product_url: () => {
				showTips('请填写宝贝链接')
			},
			product_scale: () => {
				showTips('请选择视频比例')
			}
		}
		let requirement = this.data.requirement;
		
		for (let key in requirement) {
			let value = requirement[key].trim()
			if (!!value) {
				submitData[key] = value
				// ++dataCount
			} else {
				tips[key]();
				submit = false
				break;
			}
		}
		
		
		if (submit) {
			let url = submitData.product_url;
			let index = url.search('后到')
			if(index > 0) {
				if (url.search('淘♂寳♀') > 0) {
					submitData.product_url = url.replace(url.slice(index + 2), '淘宝')
				} else if (url.search('手机天猫') > 0) {
					submitData.product_url = url.replace(url.slice(index + 2), '手机天猫')
				}
			}
			
			console.log(submitData)
			app.query('/api/bill/product', submitData, 'POST').then(res => {
				wx.navigateTo({
					url: '../order_detail/order_detail?order_id=' + submitData.bill_id
				})
			}).catch(err => {
				console.log(err)
				wx.showToast({
					title: '网络异常，请稍后重试',
					icon: 'none',
					mask: true,
					duration: 2000,
				})
			})
		}
		
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (e) {
		console.log(e)
		this.setData({
			'requirement.bill_id': e.order_id
		})
	},


	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})