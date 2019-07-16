Page({

  /**
   * 页面的初始数据
   */
  data: {
    text:'',
    type:'',
    inputVal:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const type = options.type;
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.getUser(openid, type);
      });
    } else {
      that.getUser(openid, type);
    }
  },

  getUser(openid, type){
    const app = getApp();
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.domain + '/api/user?openid=' + openid +'&type=' + type,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let user = res.data.rows;
        let text;
        if (!user){
          if (type == 'name'){
            text = app.globalData.userInfo.nickName;
          }else{
            text = '';
          }
        }else{
          text = user[type] ? user[type] : ''
        }
        that.setData({
          text,
          type
        });
        wx.hideLoading();
        //wx.setStorageSync('video', video);
      }
    });
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  change: function (e) {
    let inputVal = e.detail.value;
    this.setData({
      inputVal
    });
  },

  save(){
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    if (!openid) {
      app.login(function (openid) {
        that.saveInfo(openid);
      });
    } else {
      that.saveInfo(openid);
    }
  },

  saveInfo(openid){
    const app = getApp();
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.domain + '/api/user/save',
      method:'POST',
      data:{
        openid,
        type: this.data.type,
        inputVal: this.data.inputVal
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        wx.showToast({
          title: '修改成功',
        })
        wx.hideLoading();
        wx.navigateBack({
          
        })
      }
    });
  }

})