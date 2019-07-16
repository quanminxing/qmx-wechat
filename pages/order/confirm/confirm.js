const { each } = require('../../../js/util.js')
const app = getApp();
let openId = app.globalData.openid;
let domain;
let briefInfo = {
	name: '',
	phone: '',
	email: '',
	business: '',
	comment: '',
	work_id: '',
	worker_name: ''
};
let workerTip = false;

Page({
data: {
	submitDisabled: false,
	tvc: false,
	viewMoreIcon: '/images/more_icon.png',
	cursor: -1,
	cursorSpacing: 80,
	showMore: false,
	baseInfo: [],
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
		{ type: 'picker', label: '推荐人', name: 'worker_name', value: '', placeholder: '请选择推荐人', necessity: false, focus: false },
		{ type: 'text', label: '留言', name: 'comment', value: '', placeholder: '请留下您的留言', necessity: false, focus: false},
	],
	briefInfo: {
		name: '',
		phone: '',
		email: '',
		business: '',
		comment: '',
		work_id: '',
		worker_name: ''
	},
	isFav: false,
	workers: [],
	workerPicker: false,
	workerPickerSearch: false,
	workerSearch: []
},


onLoad(e) {
	console.log(e)
	workerTip = false;
	openId = app.globalData.openid;
	domain = app.globalData.domain;
	wx.hideLoading();
	const that = this;

	console.log(openId)
	if (!openId) {
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

// 清空留言
	onHide() {
		this.data.briefInfo.comment = '';
		this.setData({
			'formInfo[5].value': ''
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
	ifEmpty(value, label = '其他') {
		if (!!value && value !== 'null') {
			return value
		} else {
			return label
		}
	},
	suitType(ids, info) {
		if (!ids) return

		let names = ids.split(',').map(id => {
			let name = ''
			info.forEach(item => {
				if (item.id == id) {
					name = item.name
				}
			})
			return name;
		})
		return names.join('、')
	},

// 推荐人picker显示
showWorkerPicker() {
	this.setData({
		workerPicker: true
	})
},
// 推荐人picker隐藏
hideWorkerPicker(e) {
	console.log(e)
	if(e.target.dataset.close) {
		this.setData({
			workerPicker: false
		})
	}
},

// 选择推荐人
pickWorker(e) {
	let dataset = e.currentTarget.dataset;
	if(!!dataset.id) {
		this.data.briefInfo.work_id = dataset.id;
		this.data.briefInfo.worker_name = dataset.name
		this.setData({
			briefInfo: this.data.briefInfo,
			workerPicker: false,
			'formInfo[4].value': dataset.name
		})
	}
	
},

// 搜索推荐人
searchWorker(e) {
	console.log(e.detail.value)
	let searchValue = e.detail.value;

	if (searchValue.trim().length > 0 && !this.data.workerPickerSearch) {
		this.setData({
			workerPickerSearch: true
		})
	}
	if (searchValue.trim().length === 0 && this.data.workerPickerSearch) {
		this.setData({
			workerPickerSearch: false
		})
	}
	if (searchValue.trim().length > 0) {
		this.data.workerSearch = [];
		this.data.workers.forEach(item => {
			if (item.cname.search(searchValue) >= 0) {
				this.data.workerSearch.push(item)
			}
		})
		this.setData({
			workerSearch: this.data.workerSearch
		})
	}
	
},

// 表单输入事件
formInput(e) {
	let value = e.detail.value;
	let name = e.target.dataset.variables.name;
	this.data.briefInfo[name] = value;
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

// 表单提交前验证
submit() {
	console.log('提交')
	if (this.data.submitDisabled) return
	const formInfo = this.data.formInfo;
	let validLength = 0;
	each(formInfo, (item, index) => {
		if (!this.validateForm(item)) {
			return false
		}
		++validLength;
	}, this)
	if (validLength === formInfo.length) {
		if (workerTip || this.data.briefInfo.work_id) {
			this.data.submitDisabled = true
			this.submitBrief(openId);
		} else {
			wx.showModal({
				title: '提示',
				content: '你还没有填写推荐人，是否去填写推荐人?',
				cancelText: '直接下单',
				cancelColor: '#999',
				confirmText: '去填写',
				confirmColor: '#2596FF',
				success: res => {
					workerTip = true;

					if(res.confirm) {
						this.setData({
							workerPicker: true
						})
					}
					if(res.cancel) {
						this.data.submitDisabled = true
						this.submitBrief(openId);
					}
				}
			})
		}
	}
},


// 请求视频和用户信息数据
requestData(e, that, openId) {
	// 样片数据请求
	console.log(e)
	console.log(openId)
	if(e.category !== 'tvc') {
		let baseInfo = [];
		let video = {}
		let queryData = {
			_search: true,
			pageNum: 1,
			pageSize: 20,
			id: e.id,
			classify_id: e.classify_id
		}
		console.log(queryData)
		let videoInfo = app.query('/api/video', queryData)
		if(e.classify_id == 2) {
			let platforms = app.query('/platform');
			let category = app.query('/category');
			Promise.all([videoInfo, platforms, category]).then(infos => {
				console.log('讲解、infos')
				console.log(infos)
				let videoInfo = infos[0].data.data[0]
				video = {
					name: videoInfo.name,
					price: videoInfo.price,
					id: videoInfo.id,
					platform_id: videoInfo.platform_id,
					category_id: videoInfo.category_id,
					column_id: videoInfo.column_id
				}
				baseInfo = [
					{
						label: '适用平台',
						name: videoInfo.platform.split(',').join('、') || '其他'
						// name: this.suitType(videoInfo.platform, infos[1].data.rows) || '其他'
					},
					{
						label: '适用品类',
						name: videoInfo.category.split(',').join('、') || '其他'
						// name: this.suitType(videoInfo.category, infos[2].data.rows) || '其他'
					},
					{
						label: '时长',
						name: videoInfo.time || ''
					}
				]

				this.setData({
					video,
					baseInfo,
				})

			}).catch(err => {
				console.log('讲解、err')
				console.log(err)
				this.setData({
					pageShow: true,
					pageErr: true,
				})
			})
		} else {
			videoInfo.then(res => {
				console.log(res)
				let videoInfo = res.data.data[0]
				video = {
					id: videoInfo.id,
					price: videoInfo.price,
					name: videoInfo.name,
					platform_id: videoInfo.platform_id,
					category_id: videoInfo.category_id,
					column_id: videoInfo.column_id
				}
				baseInfo = [
					{
						label: '模特',
						name: videoInfo.is_model ? '有' : '无'
					},
					{
						label: '场景',
						name: this.ifEmpty(videoInfo.sence)
					},
					{
						label: '时长',
						name: videoInfo.time || ''
					},
					{
						label: '功能',
						name: this.ifEmpty(videoInfo.usage_name)
					}
				];

				this.setData({
					video,
					baseInfo
				})
			}).catch(err => {
				console.log('非讲解、err')
				console.log(err)
				this.setData({
					pageShow: true,
					pageErr: true,
				})
			})

		}
	}

	// 用户上一个订单信息录入
	wx.request({
		url: app.globalData.domain + '/api/bill/listByUser?user_id=' + openId + '&pageSize=1&pageNum=1',
		success(res) {
			console.log('用户信息8888888888888888888')
			console.log(res)
			let data = res.data.data[0]
			that.data.briefInfo = data ? data : that.data.briefInfo;
			that.data.briefInfo.comment = '';
			for (let key in that.data.briefInfo) {
				that.data.formInfo.forEach((item) => {
					if (key !== 'comment' && key === item.name) {
						item.value = that.data.briefInfo[key]
					}
				})
			}
			that.setData({
				formInfo: that.data.formInfo,
				briefInfo: that.data.briefInfo
			});
		},
		fail(err) {
			console.log(err)
		}
	})

	// 获取推荐人
	app.query('/api/info/worker').then(res => {
		console.log('推荐人000000000000000000')
		console.log(res)
		this.data.workers = res.data.data;
		this.setData({
			workers: res.data.data
		})
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
	
	console.log(`提交${this.data.briefInfo.name}`)
	console.log(this.data.formInfo)
	let data = {
		openid: app.globalData.openid,
		oper: 'add',
		name: this.data.briefInfo.name,
		business: this.data.briefInfo.business,
		phone: this.data.briefInfo.phone,
		comment: this.data.briefInfo.comment,
		email: this.data.briefInfo.email,
		work_id: this.data.briefInfo.work_id,
		worker_name: this.data.briefInfo.worker_name,
		category_id: this.data.video.category_id || '其他',
		price: this.data.video.price || '',
		platform_id: this.data.video.platform_id || '其他',
		column_id: this.data.video.column_id || '其他',
		video_id: this.data.video.id || ''
	}
	console.log(data)
	wx.request({
		url: domain + '/api/bill',
		method: 'POST',
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		data: data,
		success: res => {
			console.log(res)
			this.data.submitDisabled = false
			wx.navigateTo({
				url: '../success/success'
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