// pages/brief/confirm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: [{ id: 1, name: '银色' }], category: [{ id: 1, name: '服装' }], keys: [{ id: 1, name: '场景' }, { id: 2, name: '特效' }, { id: 3, name: '配音' }],
    phone:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    const pages = getCurrentPages() //获取加载的页面
    const currentPage = pages[pages.length - 1] //获取当前页面的对象
    const options = currentPage.options //如果要获取url中所带的参数可以查看options
    const that = this;
    let is_scene = 0,
      is_audio = 0,
      is_show = 0,
      is_model = 0,
      is_text = 0;
    const brief = wx.getStorageSync('brief');
    
    if(options.id){
      const video = wx.getStorageSync('video');

        that.setData({
          category: [{ name: video.category_name, id: video.category_id}],
          parameter: [{ name: video.price, id: 0 }],
          time: [{ name: video.time, id: 0 }],
          scale:[{name:'不限', id:0}],
          channel: [{ name: '不限', id: 0 }],
        });

    }else{
      that.setData({
        parameter: brief.parameter.filter((d) => {
          return d.checked
        }),
        category: brief.category.filter((d) => {
          return d.checked
        }),
        //时长
        time: brief.time.filter((d) => {
          return d.checked
        }),
        //视频比例
        scale: brief.scale.filter((d) => {
          return d.checked
        }),
        //渠道
        channel: brief.channel.filter((d) => {
          return d.checked
        }),

      });

    }
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

  /**
   * 提交订单
   */
  formPhone: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },
  onSubmitBrief(){
    const app = getApp();
    const openid = app.globalData.openid;
    const that = this;
    const phoneinput = this.data.phone.trim();
    if(that.data.disable === true){
      return
    }
    if (phoneinput===''){
      wx.showToast({
        title: '未填写联系方式',
        icon: 'none',
        duration: 1000
      });
      return
    }
    let reg = /^[0-9]+.?[0-9]*$/;
    if (phoneinput.length !== 11 || !reg.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式不对',
        icon: 'none',
        duration: 1000
      });
      return
    }

    that.setData({
      disable:true
    })

    if(!openid){
      app.login(function (openid) {
        that.submitBrief(openid);
      });
    }else{
      that.submitBrief(openid);
    }
  },

  submitBrief(openid){
    const app = getApp();
    const domain = app.globalData.domain;
    let opts = {
      url: domain + '/bill',
      data: {
        openid,
        oper: 'add',
        name: '新需求brief',
        business: '商家',
        price: this.data.parameter[0].name,
        phone: this.data.phone || '',
        category_id: this.data.category[0].id,
        time: this.data.time[0].name,
        scale: this.data.scale[0].name,
        channel: this.data.channel[0].name,
      },

      method: 'POST',
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        wx.navigateTo({
          url: '/pages/brief/success',
        });
      },
      fail: function (res) {
        console.log('添加失败');
      }
    }
    wx.request(opts);
  }
  
})