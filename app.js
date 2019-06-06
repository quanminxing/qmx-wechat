//app.js
App({
	globalData: {
		userInfo: null,
		phone: '17034642312',
		tabBarParam: {},  // switchTab 跳转参数
		//domain: 'http://192.168.2.183',
		//domain:'http://localhost:7001',
		domain: 'https://admin.qmxpower.com',
		// domain: 'https://test.qmxpower.com'
	},


	/**
	 * 全局函数
	 */
	// toast 提示
	showToast(toast, time = 2000) {
		return new Promise(resolve => {
			wx.showToast(toast);
			setTimeout(() => {
				wx.hideToast();
				resolve();
			}, time)
		})  
	},

	// loading 提示
	loading(title = '加载中', mark = true) {
		wx.showLoading({
			title,
			mark,
		})
	},

	// request 请求
	query(url, data = null, method = 'GET', responseType) {
		return new Promise((resolve, reject) => {
			let timer = null;
			let queryData = {
				url: this.globalData.domain + url,
				method,
				success: res => {
					clearTimeout(timer)
					if(!!res.data.status ) {
						if (res.data.status === 200) {
							console.log('数据请求成功')
							console.log(res)
							resolve(res)
						} else {
							
							console.log(res)
							reject(res)
						}
					} else {
						if (res.statusCode === 200) {
							console.log('数据请求成功')
							resolve(res)
						} else {
							console.log('数据请求出错res')
							reject(res)
						}
						
					}
				},
				fail: err => {
					clearTimeout(timer)
					console.log('数据请求出错err')
					console.log(err)
					reject(err)
				}
			}
			if (!!data) {
				queryData.data = data
			}
			if (method === 'POST') {
				queryData.header = {
					'content-type': 'application/json'
				}
			}
			if (!!responseType) {
				queryData.responseType = responseType
			}
			let requesTask = wx.request(queryData);

			timer = setTimeout(() => {
				requesTask.abort();
				console.log('数据请求网络超时')
				reject('网络超时');
			}, 5000);
		})		
	},

	// 登录
	appLogin() {
		wx.login({
			success: res => {
				console.log(res)
				this.query('/api/login', { js_code: res.code }, 'POST')
				.then(res => {
					console.log('login 返回 res 信息')
					console.log(res)
					if (res.statusCode === 200) {
						this.globalData.openid = res.data.openid
					}
					if (this.loginCallback) {
						console.log('login 登陆成功后执行的回调')
						this.loginCallback(res)
					}
					if (this.userInfoCallback) {
						console.log('获取用户信息成功后执行的回调')
						this.userInfoCallback(res)
					}

					console.log('globalData 信息：openid')
					console.log(this.globalData)
				})
				.catch(err => {
					console.log(err)
				})
			}
		})
	},

	// 获取用户信息
	callUserInfo() {
		const getInfo = () => {
			wx.getUserInfo({
				withCredentials: true,
				success: res => {
					this.globalData.userInfo = res.userInfo
					console.log('globalData 信息：userInfo')
					console.log(this.globalData)
				},
				fail: err => {
					console.log(err)
				}
			})
		}
		wx.checkSession({
			success: () => {
				// 登录有效
				console.log('登录有效')
				getInfo();
			},
			fail: () => {
				// 登录失效
				console.log('登录失效')
				this.userInfoCallback = function () {
					getInfo();
				}
			}
		})	
	},
	getUserInfo() {
		wx.getSetting({
			success: res => {
				console.log(res)
				if (res.authSetting['scope.userInfo']) {
					// 已授权
					console.log('已授权')
					this.callUserInfo();
				} else {
					// 未授权
					console.log('未授权')
					wx.showModal({
						title: '授权提示',
						content: '尚未进行授权，请点击确定进入授权页面进行授权',
						success: res => {
							if (res.confirm) {
								wx.navigateTo({
									url: '/pages/index/login',
								})
							}
						}
					})
				}
			}
		})
	},

	/**
	 * 生命周期函数
	 */
  onLaunch: function () {
		// 登录
		this.appLogin();

		// 获取用户信息
		this.getUserInfo();

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
	
	/**
	 * app全局监听函数
	 */

	// 监听页面不存在
  onPageNotFound(res) {
		let toast = {
			title: '该页面不存在，即将跳转到首页！',
			icon: 'none'
		}
		this.showtToast(toast, 1500).then(() => {
			wx.switchTab({
				url: 'pages/find/index',
			});
		})  
  },
	// 错误监听
	onError(err) {
		console.log(err)
	},

  login(cb){
    
    const that = this;
    wx.login({
      success: function (e) {
				console.log(e.code)
        let opts = {
          url: that.globalData.domain + '/api/login',
          data: {
            js_code: e.code,
          },
          method: 'POST',
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
						console.log(res)
            that.globalData.openid = res.data.openid;
						console.log(that)
            typeof cb == "function" && cb(res.data.openid);
          },
          fail: function (res) {
            console.log('获取登录信息失败');
          }
        }
        wx.request(opts);
      }
    });
  },
})