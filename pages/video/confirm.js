// pages/video/confirm.js
const { each } = require('../../utils/util.js')
const app = getApp();
let openId = app.globalData.openid;
let domain;
let briefInfo = {
	name: '',
	phone: '',
	email: '',
	business: '',
	comment: ''
};

Page({
data: {
	tvc: false,
	viewMoreIcon: '../../images/more_icon.png',
	cursor: -1,
	cursorSpacing: 80,
	showMore: false,
	video: {
		video_id: null,
		name: '',
		platform: '',
		platform_id: 0,
		column: '',
		column_id: 0,
		category: '',
		category_id: 0,
		keystrings: [],
		price: 0,
	},
	formInfo: [
		{ type: 'text', label: '姓名', name: 'name', value: '', placeholder: '请输入您的姓名', necessity: true, validityMsg: '请输入您的姓名', focus: false },
		{ type: 'number', label: '手机号', name: 'phone', value: '', placeholder: '将用于联系您以确认视频需求', necessity: true, validityType: 'phone', validityMsg: '请输入正确的手机号', focus: false },
		{ type: 'text', label: '邮箱', name: 'email', value: '', placeholder: '视频将以邮件的方式发送至邮箱', necessity: true, validityType: 'email', validityMsg: '请输入正确的邮箱', focus: false },
		{ type: 'text', label: '公司名称', name: 'business', value: '', placeholder: '请输入您的公司名称', necessity: true, validityType: '', validityMsg: '请输入您的公司名称', focus: false },
		{ type: 'text', label: '留言', name: 'comment', value: '', placeholder: '请留下您的留言', necessity: false, focus: false},
	],
	isFav: false,
},

onLoad(e) {
	console.log(e)
	openId = app.globalData.openid;
	domain = app.globalData.domain;
	wx.hideLoading();
	const that = this;
	if (!openId) {
		console.log(openId)
		app.login(function (openId) {
			if(e.category === 'tvc') {
				that.setData({
					tvc: true
				})
				wx.setNavigationBarTitle({
					title: 'TVC、视频定制'
				});
			}
			that.requestData(e, that, openId)
			
		})
	}else {
		if(e.category === 'tvc') {
			that.setData({
				tvc: true
			})
			wx.setNavigationBarTitle({
				title: 'TVC、视频定制'
			});
		}
		that.requestData(e, that, openId)
		
	}
},

onHide() {
	briefInfo.comment = '';
	this.setData({
		'formInfo[4].value': ''
	})
},

phoneCall(e) {
	console.log(e)
	let phoneNum = e.currentTarget.dataset.phonenum;
	console.log(phoneNum)
	wx.makePhoneCall({
		phoneNumber: phoneNum
	});
},

/** start bind 事件函数 */
focus(e) {
	each(this.data.formInfo, (item) => {
		if(item.name === e.target.dataset.variables.name) {
			item.focus = true
		} else {
			item.focus = false;
		}
	}, this)
	this.setData({
		formInfo: this.data.formInfo
	})
},
viewMore() {
	this.setData({
		showMore: true
	})
},
formInput(e) {
	let value = e.detail.value;
	let name = e.target.dataset.variables.name;
	briefInfo[name] = value;
	each(this.data.formInfo, (item, index) => {
		let dataKey = `formInfo[${index}].value`;
		if (!!item.name && item.name === name) {
			this.setData({
				[dataKey]: value
			})
			return false;
		}
	}, this)
},
submit() {
	const formInfo = this.data.formInfo;
	let validLength = 0;
	each(formInfo, (item, index) => {
		if (!this.validateForm(item)) {
			return false
		}
		++validLength;
	}, this)
	if (validLength === formInfo.length) {
		this.submitBrief(openId);
	}
},
/** end bind 事件函数 */

// 请求页面数据
requestData(e, that, openId) {
	// 样片数据请求
	console.log(e)
	if(e.category !== 'tvc') {
		wx.request({
			url: app.globalData.domain + '/api/video?_search=true&id=' + e.id,
			success(res) {
				console.log(res)
				if (res.data.data.length > 0) {
					const video = res.data.data[0];
					if (!!video) {
						let keystrings = [];
						if (!!video.keystring) {
							keystrings = video.keystring.replace(/^\s+|\s+$/g, '')
							keystrings = keystrings.split(/\n+/).map((item) => {
								if (!item) return
								const keystring = item.split('|')
								const keyItem = {
									name: keystring[0].trim(),
									value: keystring[1].trim() || ''
								}
								return keyItem;
							});
						}
						that.setData({
							video: {
								video_id: video.video_id,
								name: video.name,
								platform: video.platform_name,
								platform_id: video.platform_id,
								column: video.column_name,
								column_id: video.column_id,
								category: video.category_name,
								category_id: video.category_id,
								keystrings: keystrings,
								price: video.price.toFixed(2)
							}
						})
					}
				}

			}
		})
	}
	

	// 用户上一个订单信息录入
	wx.request({
		url: app.globalData.domain + '/bill/listByUser?openid=' + openId + '&pageSize=1&pageNum=1',
		success(res) {
			console.log(res)
			let data = res.data.rows[0]
			briefInfo = data ? data : briefInfo;
			for (let key in briefInfo) {
				that.data.formInfo.forEach((item) => {
					if (key !== 'comment' && key === item.name) {
						item.value = briefInfo[key]
					}
				})
			}
			that.setData({
				formInfo: that.data.formInfo
			});
			briefInfo.comment = '';
		},
		fail(err) {
			console.log(err)
		}
	})
	// 日志
	that.recordLog(openId, '302')
},

// 表单验证函数
validateForm(item) {
	if(!formValidity(item)) {
		wx.showToast({
			title: item.validityMsg || '请输入正确的信息',
			icon: 'none',
			duration: 1000
		})
		return false;
	} else {
		return true;
	}

	// 表单有效性
	function formValidity(item) {
		if (!item.necessity) {
			return true;
		}
		let required = necessity(item);
		if (!!item.validityType) {
			return required && validity(item)
		} else {
			return required;
		}

		// 表单必填性验证
		function necessity(item) {
			if (!!item.value && item.value !== '') {
				return true;
			} else {
				return false;
			}
		}

		// 表单有效性验证
		function validity(item) {
			const validityTypes = {
				phone(value) {
					return /^1\d{10}$/.test(value);
				},
				email(value) {
					return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(value);
				}
			}
			if (necessity(item)) {
				return validityTypes[item.validityType](item.value)
			} else {
				return false;
			}
		}
	}
},

// 表单提交
submitBrief(openId) {
	console.log(`提交${briefInfo.name}`)
	console.log(this.data.formInfo)
	let data = {
		openid: app.globalData.openid,
		oper: 'add',
		name: briefInfo.name,
		business: briefInfo.business,
		phone: briefInfo.phone,
		comment: briefInfo.comment,
		email: briefInfo.email,
		category_id: this.data.video.category_id || null,
		price: this.data.video.price || null,
		platform_id: this.data.video.platform_id || null,
		column_id: this.data.video.column_id || null,
		video_id: this.data.video.video_id || null
	}
	console.log(data)
	wx.request({
		url: domain + '/bill',
		method: 'POST',
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		data: data,
		success: function (res) {
			wx.navigateTo({
				url: '/pages/brief/success'
			});
		},
		fail: function (err) {
			wx.showToast({
				title: '网络异常，请重试',
				icon: 'none',
				duration: 1000
			})
		}
	})
},

// 日志
recordLog(openId, videoId) {
	wx.request({
		url: app.globalData.domain + '/api/fav/findByUser?openid=' + openId + '&id=' + videoId,
		success: function (res) {
			if (res.data.result && res.data.result.length !== 0) {
				that.setData({
					isFav: true,
				});
			}
		}
	})

	wx.request({
		url: domain + '/api/log',
		data: {
			openid: openId,
			video_id: videoId,
		},
		method: 'POST',
		success: function (res) {
			console.log('记录日志成功！openid:' + openId + ', video_id:' + videoId);
		}

	});
},
	onShareAppMessage: function () {

	},
})