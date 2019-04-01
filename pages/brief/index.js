// pages/brief/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: [{ id: 1, name: '不限' }, { id: 2, name: '0-999' }, { id: 3, name: '1000-2999' }, { id: 4, name: '3000-4999' }, { id: 5, name: '5000-9999' }, { id: 6, name: '10000以上' }], category: [{ id: 1, name: '服装' }, { id: 2, name: '电子' }, { id: 3, name: '宠物' }], time: [{ id: 1, name: '不限' }, { id: 2, name: '15秒' }, { id: 3, name: '30秒' }, { id: 4, name: '45秒' }, { id: 5, name: '60秒' }, { id: 6, name: '90秒' }, { id: 7, name: '120秒' }, { id: 8, name: '其他' }], scale: [{ id: 1, name: '16:9（宽屏横版）' }, { id: 2, name: '4:3（宽屏横版）' }, { id: 3, name: '9:16（竖版）' }, { id: 4, name: '3:4（竖版）' }], channel: [{ id: 1, name: '其他' }, { id: 2, name: '京东' }, { id: 3, name: '有好货/微淘' }, { id: 4, name: '每日好店/微淘' }, { id: 5, name: '淘宝双十二' }, { id: 6, name: '爱逛街' }, { id: 7, name: '哇哦短视频' }, { id: 8, name: '直播' }, { id: 9, name: '宣传片' }, { id: 10, name: '淘宝头图' }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const app = getApp();
    const domain = app.globalData.domain;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: domain + '/category',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let category = res.data.rows.filter((d)=>{
          return d.parent_id === 0
        });
        category[0].checked = true;
        wx.hideLoading();
        that.setData({
          category,
        });
      }
    })


    this.data.parameter[0].checked = true;
    this.data.time[0].checked = true;
    this.data.scale[0].checked = true;
    this.data.channel[0].checked = true;
    this.setData({
      parameter: this.data.parameter,
      time: this.data.time,
      scale: this.data.scale,
      channel: this.data.channel,
    })
  },
  parameterTap: function (e) {//e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
    var that = this
    var this_checked = e.currentTarget.dataset.id
    var parameterList = this.data.parameter//获取Json数组
    for (var i = 0; i < parameterList.length; i++) {
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = true;//当前点击的位置为true即选中
      }
      else {
        parameterList[i].checked = false;//其他的位置为false
      }
    }
    that.setData({
      parameter: parameterList
    })
  },
  clear(){
    this.setData({
      parameter: this.data.parameter.map((d) => { d.checked = false; return d }),
      category : this.data.category.map((d)=>{d.checked = false; return d}),
      time: this.data.time.map((d) => { d.checked = false; return d }),
      scale: this.data.scale.map((d) => { d.checked = false; return d }),
      channel: this.data.channel.map((d) => { d.checked = false; return d }),
    })
  },
  categoryTap: function (e) {//e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
    var that = this
    var this_checked = e.currentTarget.dataset.id
    var parameterList = this.data.category//获取Json数组
    for (var i = 0; i < parameterList.length; i++) {
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = true;//当前点击的位置为true即选中
      }
      else {
        parameterList[i].checked = false;//其他的位置为false
      }
    }
    that.setData({
      category: parameterList
    })
  },
  channelTap: function (e) {//e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
    var that = this
    var this_checked = e.currentTarget.dataset.id
    var parameterList = this.data.channel//获取Json数组
  
    for (var i = 0; i < parameterList.length; i++) {
      /*
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = !parameterList[i].checked;//多选
      }*/
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = true;//当前点击的位置为true即选中
      }
      else {
        parameterList[i].checked = false;//其他的位置为false
      }
    }
    that.setData({
      channel: parameterList
    })
  },
  timeTap: function (e) {//e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
    var that = this
    var this_checked = e.currentTarget.dataset.id
    var parameterList = this.data.time//获取Json数组

    for (var i = 0; i < parameterList.length; i++) {
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = true;//当前点击的位置为true即选中
      }
      else {
        parameterList[i].checked = false;//其他的位置为false
      }
    }
    that.setData({
      time: parameterList
    })
  },
  scaleTap: function (e) {//e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
    var that = this
    var this_checked = e.currentTarget.dataset.id
    var parameterList = this.data.scale//获取Json数组

    for (var i = 0; i < parameterList.length; i++) {
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = true;//当前点击的位置为true即选中
      }
      else {
        parameterList[i].checked = false;//其他的位置为false
      }
    }
    that.setData({
      scale: parameterList
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  generate :function(){
    if (this.data.parameter.filter((d)=>{return d.checked === true}).length===0){
      wx.showToast({
        title: '请选择价格',
        icon: 'none',
        duration: 1000
      });
      return
    }
    if (this.data.category.filter((d) => { return d.checked === true }).length === 0) {
      wx.showToast({
        title: '请选择类目',
        icon: 'none',
        duration: 1000
      });
      return
    }
    /*
    if (this.data.keys.filter((d) => { return d.checked === true }).length === 0) {
      wx.showToast({
        title: '请选择颗粒度',
        icon: 'none',
        duration: 1000
      });
      return
    }*/
    /*
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())*/
    wx.setStorageSync('brief', {
      parameter: this.data.parameter,
      category: this.data.category,
      time: this.data.time,
      scale: this.data.scale,
      channel: this.data.channel,
    });
    wx.navigateTo({
      url: '/pages/brief/confirm',
    });
  }
})