//app.js
App({
	globalData: {
		userInfo: {},
		register: true,
		servicePhone: '17034642312',
		tabBarParam: {},  // switchTab 跳转参数
		// domain: 'https://admin.qmxpower.com',
		domain: 'https://test.qmxpower.com'
	},

	/* ----------start-------

		以下代码根据1.4.0版本需求修改或新增
		除此之外，其他所有页面和代码均为1.4.0版本以前的
	
	*/

	// toast 提示
	showToast(tip, duration = 2000, mask=true, icon='none',image='') {

		return new Promise(resolve => {
			let options = {
				title: tip,
				duration,
				mask,
				icon,
				success() {
					resolve()
				}
			}
			if (!!image) {
				options.image = image
			}
		})
		wx.showToast(options)
	},

	// loading 提示
	loading(title = '加载中', mask = true) {
		return new Promise(resolve => {
			wx.showLoading({
				title,
				mask,
				success() {
					resolve()
				}
			})
		})
		
	},

	// request 封装
	query(url, method='GET', data='', responseType='') {
		return new Promise((resolve, reject) => {
			let queryData = {
				url: this.globalData.domain + url,
				method,
				success(res) {
					let resData = res.data;
					if (resData.status === 200) {
						resolve(resData.data)
					} else {
						reject(resData)
					}
				},
				fail(err) {
					reject(err)
				}
			}

			if(!!data) queryData.data = data;
			if(!!responseType) queryData.responseType = responseType

			wx.request(queryData)
		})
	},

	// 登陆
	appLogin(shareCode) {
		let domain = this.globalData.domain;
		const login = () => {
			return new Promise((resolve, reject) => {
				wx.login({
					timeout: 6000,
					success: (loginRes) => {
						wx.request({
							url: domain + '/api/loginByWechat',
							method: 'POST',
							data: {
								js_code: loginRes.code,
								shareCode: shareCode || ''
							},
							success: (res) => {
								let resData = res.data;
								if (resData.status === 200) {
									let userInfo = resData.data;
									this.globalData.userInfo = userInfo
									wx.setStorage({
										key: 'userInfo',
										data: userInfo,
									})
									resolve(resData.data)
								} else {
									reject()
								}
							},
							fail: () => {
								reject()
							}
						})
					},
					fail: (loginErr) => {
						console.log(loginErr)
						reject()
					}
				})
			})
		};
		const logincb = (sessionToken) => {
			if(this.logincb) {
				this.logincb(sessionToken)
			}
		}
		const sharecb = (shareCode) => {
			if (!!this.sharecb) {
				this.sharecb(shareCode)
			}
		}

		return new Promise((resolve, reject) => {
			let storageUserInfo = wx.getStorageSync('userInfo');
			console.log('storage 的 userInfo 信息')
			console.log(storageUserInfo)
			if (storageUserInfo) {
				console.log('------------------已登录-------------------------')
				this.globalData.userInfo = storageUserInfo

				if (!storageUserInfo.user.phone) {
					// ---------------没有注册手机号: login后才能解密-------------------------
					login().then(userInfo => {

						this.globalData.register = false;

						sharecb(userInfo.user.shareCode)
						logincb(userInfo.sessionToken);
						resolve(userInfo)
					}).catch(err => {

						this.showToast('网络异常，请检查网络后重试')

						sharecb('')
						logincb(storageUserInfo.sessionToken);
						resolve(storageUserInfo)
						reject()
					})
				} else {
					// ------------------已注册手机号------------------------------
					this.globalData.register = true;

					sharecb(storageUserInfo.user.shareCode)
					logincb(storageUserInfo.sessionToken);
					resolve(storageUserInfo)
				}
			} else {
				console.log('------------------未登陆---------------------------------')
				login().then(userInfo => {
					if (!storageUserInfo.user.phone) {
						// --------------- 没有注册手机号 -------------------------
						this.globalData.register = false;
					}

					sharecb(userInfo.user.shareCode)
					logincb(userInfo.sessionToken);
					resolve(userInfo)
				}).catch(err => {
					
					this.showToast('网络异常，请检查网络后重试')
					sharecb('')
					reject()
				})
			}
		})
	},

	shareMessage(path, shareCode, params = '', title = '宜拍短视频公共', imageUrl='') {
		let returnData = {
			title,
			path: `${path}?shareCode=${shareCode}`
		}
		if (!!params) {
			for(let key in params) {
				returnData.path += `&${key}=${params[key]}`
			}
		}
		if(!!imageUrl) {
			returnData.imageUrl = imageUrl
		}

		return returnData
	},

	/* ----------end-------
	
		以上代码根据1.4.0版本需求修改或新增
		除此之外，其他所有页面和代码均为1.4.0版本以前的
	
	*/

	

	// 瀑布流布局: 先将图片渲染到页面，从而触发image的bindload事件获得图片宽高信息，再重新计算渲染
	drawWaterfall(colWidth, colsHeight, imgDetail, imgData, index, imgsLength, waterfallDatas, page) {
		console.log('瀑布流')
		console.log(index)
		console.log(imgsLength)
		
		if (colsHeight[0] > colsHeight[1]) {
			colsHeight[1] += colWidth * imgDetail.height / imgDetail.width;
			waterfallDatas[1].push(imgData);
		} else {
			colsHeight[0] += colWidth * imgDetail.height / imgDetail.width;
			waterfallDatas[0].push(imgData);
		}

		if (!page.data.waterfallShow) {
			page.setData({
				waterfallShow: true
			})
		}
		if(index == (imgsLength - 1)) {
		// if (imgsLength == waterfallDatas[0] + waterfallDatas[1]) {
			page.setData({
				colsHeight,
				waterfallDatas
			})
			setTimeout(() => {
				wx.hideLoading()
			}, 2000)
			console.log('最后一个')
			console.log(waterfallDatas)
		} else if (index % 6 === 0) {
			page.setData({
				waterfallDatas
			})
		}
		
	},


  onLaunch: function (e) {
		console.log(e)
		let queryParams = e.query
		this.appLogin(queryParams.shareCode || '').then()
		

		// 小程序新版本更新提示
		const updateManager = wx.getUpdateManager();
		updateManager.onUpdateReady(function () {
			wx.showModal({
				title: '更有新版本啦！',
				content: '小程序发布了新功能，是否更新至最新版本?',
				cancelColor: '#999',
				confirmColor: '',
				success: function (res) {
					if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						updateManager.applyUpdate()
					}
				}
			})
		})
		updateManager.onUpdateFailed(function () {
			wx.showToast({
				title: '更新失败，请关闭微信后重新打开小程序。',
				icon: 'none',
				duration: 2500,
				mask: false
			})
		})
  },
	
	// 监听页面不存在
  onPageNotFound(res) {
		
		this.showToast('该页面不存在，即将跳转到首页！', 1500).then(() => {
			wx.switchTab({
				url: 'pages/index/index',
			});
		})  
  },

	// 错误监听
	onError(err) {
		console.log(err)
	},
  
})