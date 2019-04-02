//app.js
App({
  onLaunch: function () {
    
    //调用API从本地缓存中获取数据
      wx.showLoading({
        title: '加载中',
        mask: true
    });
    
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        //此处为获取微信信息后的业务方法
      },
      fail: function () {
        //获取用户信息失败后。请跳转授权页面
        wx.showModal({
          title: '警告',
          content: '尚未进行授权，请点击确定跳转到授权页面进行授权。',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              wx.navigateTo({
                url: '/pages/index/login',
              })
            }
          }
        })
      }
    });

    const updateManager = wx.getUpdateManager()
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
  onPageNotFound(res) {
    wx.switchTab({
      url: 'pages/find/index',
    });
  },

  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              console.log(res);
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },

  login(cb){
    
    const that = this;
    wx.login({
      success: function (e) {
        let opts = {
          url: that.globalData.domain + '/api/login',
          data: {
            js_code: e.code,
          },
          method: 'POST',
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            that.globalData.openid = res.data.openid;
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

	// const show

  globalData:{
    userInfo:null,
    tabBarParam: {},
    //domain: 'http://192.168.2.183',
    //domain:'http://localhost:7001'
  //  domain:'https://admin.qmxpower.com',
		domain: 'https://test.qmxpower.com'
  }
})

// 删除历史记录
// 关于我们
// 修改信息
