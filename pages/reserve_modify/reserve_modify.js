// pages/reserve_modify/reserve_modify.js

const { each } = require('../../utils/util.js')

const app = getApp();

Page({

	data: {
		pageShow: true,
		pageErr: false,
		id: null,
		reserve: [
			{ index: 0, label: '姓名', name: 'name', value: '', placeholder: '请输入您的姓名', necessity: true, validityMsg: '请输入您的姓名' },
			{ index: 1, type: 'number', label: '手机号', name: 'phone', value: '', placeholder: '将用于联系您以确认视频需求', necessity: true, validityType: 'phone', validityMsg: '请输入正确的手机号' },
			{ index: 2, label: '邮箱', name: 'email', value: '', placeholder: '视频将以邮件的方式发送至邮箱', necessity: true, validityType: 'email', validityMsg: '请输入正确的邮箱' },
			{ index: 3, label: '公司名称', name: 'business', value: '', placeholder: '请输入您的公司名称', necessity: true, validityType: '', validityMsg: '请输入您的公司名称' },
			{ index: 4, label: '留言', name: 'comment', value: '', placeholder: '请留下您的留言', necessity: false },
		]
	},

	// 表单输入事件
	formInput(e) {
		console.log(e)
		let value = e.detail.value;
		let source = e.target.dataset.source;
		let name = source.name;
		let index = source.index;
		let reserve = `reserve[${index}].value`
		// this.data.reserve[index].value = value
		this.setData({
			[reserve]: value
		})
	},

	// 清除表单输入
	clear(e) {
		let reset = `reserve[${e.target.dataset.index}].value`;
		this.setData({
			[reset]: ''
		})
	},

	// 确认按钮点击事件
	confirm() {
		let formData = this.data.reserve;
		let validLength = 0;

		each(formData, function(item, index) {
			if (!this.validateForm(item)) {
				wx.showToast({
					title: item.validityMsg || '请输入正确的信息',
					icon: 'none',
					duration: 1500
				})
				return false
			}

			validLength = index;

		}, this)

		console.log(validLength)
		if(validLength >= formData.length - 1) {
			this.submit();
		}
	},

	// 表单验证函数：返回 true 或 false
	validateForm(input) {
		let inputValue = `${input.value}`.trim();
		console.log(input.label)
		console.log(inputValue)

		// 必填性
		const necessity = function(input) {
			if (!input.necessity) return true;
			
			if (!!inputValue) return true;

			return false;
		}

		// 有效性
		const validity = function(input) {
			if (!inputValue) return true;

			const type = {
				phone(value) {
					return /^1\d{10}$/.test(value);
				},
				email(value) {
					return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(value);
				}
			}

			let validityType = input.validityType;

			if(!!validityType) return type[validityType](inputValue)

			return true
		}

		return necessity(input) && validity(input)
		
	},

	// 表单数据提交函数
	submit() {
		console.log('开始提交数据')
		let reserve = this.data.reserve;
		let queryData = {
			id: this.data.id,
			name: reserve[0].value,
			phone: reserve[1].value,
			email: reserve[2].value,
			business: reserve[3].value,
			comment: reserve[4].value
		}
		console.log('提交的数据')
		console.log(queryData)
		app.query('/api/bill/buyerInfo', queryData, 'POST').then(res => {
			console.log('修改成功')
			app.showToast({
				title: '修改成功'
			}, 1000).then(() => {
				wx.navigateBack({
					delta: 1
				})
			})
			
		}).catch(err => {
			console.log('修改失败')
			wx.redirectTo({
				url: '/pages/order_detail/order_detail',
			})
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		let reserveInfo = app.globalData.reserve;
		let reserve = this.data.reserve;
		this.data.id = reserveInfo.id;
		console.log(reserve)

		reserve.forEach(item => {
			each(reserveInfo.data, function(reserveItem) {
				if (item.name === reserveItem.key) {
					item.value = reserveItem.value
					return false;
				}
			}, this)
		})
		this.setData({
			reserve
		})
	},

})