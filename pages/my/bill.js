//index.js
//获取应用实例
// 个人网易云音乐 ID  66919655
var app = getApp()
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    tabs: [{
      name: "全部订单",
      id: 4
    }, {
      name: "未沟通",
      id: 0
    }, {
      name: "进行中",
      id: 1
    }, {
      name: "已完成",
      id: 2
    }],
    remoteBills: [],
    bills: [],
    activeIndex: 0,
    sliderOffset: 30,
    sliderLeft: 0,
  },
  onShow: function() {
    wx.hideLoading()
  },
  getBill(openid){
    const app = getApp();
    const domain = app.globalData.domain;
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: domain + '/bill/listByUser?openid=' + openid,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {

        let remoteBills = res.data.rows;
        wx.hideLoading();
        that.setData({
          remoteBills: res.data.rows,
          bills: remoteBills,
        });
      }

    });
  },
  onLoad: function() {
    var that = this;
    
    const app = getApp();
    const openid = app.globalData.openid;
    
    if (!openid) {
      app.login(function (openid) {
        that.getBill(openid);
      });
    } else {
      that.getBill(openid);
    }
  },
  tabClick: function(e) {
    /*
    setTimeout(function () {
      console.log(e.currentTarget.id, e.currentTarget);
      var query = wx.createSelectorQuery();
      query.select(e.currentTarget.id).boundingClientRect(function (rect) {
        console.log(rect);
      }).exec();
    }, 100)
*/
    let bills;
    if (Number(e.currentTarget.id) !== 4) {
      bills = this.data.remoteBills.filter((d) => {
        return Number(e.currentTarget.id) === d.status
      });
    } else {
      bills = this.data.remoteBills
    }
    let index;
    this.data.tabs.forEach((d, i) => {
      if (d.id === Number(e.currentTarget.id)) {
        index = i;
      }
    })
    console.log(e.currentTarget.offsetLeft);

    this.setData({
      sliderOffset: e.currentTarget.offsetLeft + 28,
      activeIndex: index,
      bills: bills,
    });
  },
});