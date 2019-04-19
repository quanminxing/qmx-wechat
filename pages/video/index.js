//index.js
var cityData = require('../../utils/city.js');

var app = getApp()
Page({
  data: {
    tvc: false,
    tvcTemp: '类目定制视频列表',
    inputShowed: false,
    inputVal: "",
    tabs: [],
    activeIndex: 0,
    sliderOffset: 30,
    sliderLeft: 0,
    videos: [],
		nv: '',
		qy: '',
    content: [],
    nv: ['衣服', '裤子', '内衣', '服饰', '衣服', '裤子', '内衣', '服饰', '衣服', '裤子', '内衣', '服饰'],
    px: ['默认排序', '离我最近', '价格最低', '价格最高'],
    qyopen: false,
    qyshow: false,
    stopen: false,
    stshow: false,
    nzopen: false,
    pxopen: false,
    nzshow: false,
    pxshow: false,
    isfull: false,
    cityleft: {},
    citycenter: {},
    cityright: {},
    select1: '',
    select2: '',
    shownavindex: '',
    search:{
			pageNum: 1,
      pageSize: 20,
			sidx: 'price',
			sord: 'asc'
    },
    usage_name:'',
    category_name:'',
    platform_name:''
  },

  onReachBottom: function(){
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let videos = that.data.videos;
		that.data.search.pageNum+=1;
		that.data.search._search = true;
		that.data.search.classify_id='1,3';
    wx.request({
			url: app.globalData.domain + '/api/video',
      header: {
        'Content-Type': 'application/json'
      },
      data: that.data.search,
      success: function (res) {
        let v = [];
        res.data.data.forEach((d) => {
          // 判断用什么播放器播放
          if (d.url && d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          v.push(d);
        });
        videos = videos.concat(v);
        wx.hideLoading();
        that.setData({
          videos,
          search:that.data.search
        });
        wx.hideLoading()
      }

    });
  },

  showInput: function () {
    wx.navigateTo({
      url: '/pages/find/search',
    })
  },

  onLoad: function () {
		console.log('onshow3333333333333333333333333')
    var that = this;

    const app = getApp();
    const openid = app.globalData.openid;

    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({  // 风格
      url: app.globalData.domain + '/style',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        res.data.rows = res.data.rows.unshift({
          id: 0,
          name: "全部",
        });
        that.setData({
          st: res.data.rows
        });
      }
    });
    wx.request({  // 功能
      url: app.globalData.domain + '/usage',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        res.data.rows.unshift({
          id: 0,
          name: "全部",
        });
        that.setData({
          px: res.data.rows,
        });
      }
    });

    wx.request({  // 平台
      url: app.globalData.domain + '/platform',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        that.setData({
          platforms: res.data.rows,
        });
      }
    });

    // 搜索视频
    wx.request({ //
      url: app.globalData.domain + '/column/listall',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        that.setData({
          cityleft: res.data,
        });
      }
    });

    wx.request({ // 类目
      url: app.globalData.domain + '/category',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let category = res.data.rows.filter((d) => {
          return d.parent_id === 0
        });
        
        category.unshift({
          id: 0,
          name: "全部",
        });
        that.setData({
          nv: category,
        });
        
        console.log(app.globalData)
        let categoryId = app.globalData.tabBarParam.category_id;
        console.log(categoryId)
        if(categoryId === null || categoryId === undefined) {
          // 视频搜索过滤
					that.data.search._search = true;
					that.data.search.classify_id = '1,3';
					
					console.log(that.data.search)
          wx.request({
            url: app.globalData.domain + '/api/video',
            header: {
              'Content-Type': 'application/json'
            },
            data: that.data.search,
            success: function (res) {
              let videos = [];
							console.log(res)
              res.data.data.forEach((d) => {
  
                let categoryChoose = that.data.tabs.filter((category) => {
                  return category.id === d.category_id
                });
  
                d.category_name = categoryChoose[0] ? categoryChoose[0].name : '';
                // 判断用什么播放器播放
                if (d.url && d.url.indexOf('embed') !== -1) {
                  d.url = d.url.match(/vid=([^&]+)/)[1];
                  d.isqq = true;
                } else {
                  d.isqq = false;
                }
                videos.push(d);
              });
              wx.hideLoading();
              that.setData({
                videos,
              });
            }
  
          });
        } else {
          const domain = app.globalData.domain;
          
          let categoryName = app.globalData.tabBarParam.category_name;
          console.log(categoryId)
          console.log(categoryName)
          const search = that.data.search;
					search._search = true;
					search.classify_id = '1,3';
          search.category_id = categoryId;
          if (categoryId == 0){
            delete search.category_id
          }
          const queryString = '';
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          console.log(search)
          wx.request({
            url: domain + '/api/video',
            data:search,
            header: {
              'Content-Type': 'application/json'
            },
            success: function (res) {

              res.data.data = res.data.data.map((d) => {
                // 判断用什么播放器播放
                if (d.url.indexOf('embed') !== -1) {
                  d.url = d.url.match(/vid=([^&]+)/)[1];
                  d.isqq = true;
                } else {
                  d.isqq = false;
                }
                return d
              });
              wx.hideLoading();
              that.setData({
                videos: res.data.data,
                nzopen: false,
                isfull:false,
                shownavindex: 0,
                category_name: categoryName,
                search
              });
              app.globalData.tabBarParam = {}
            }
          });
        }
        
      }
    });
		wx.hideLoading()
  },

  chooseCategory:function(e){
    const app = getApp();
    const domain = app.globalData.domain;
    let category_id = e.currentTarget.dataset.id;
    let category_name = e.currentTarget.dataset.name;
    const that = this;
		let url = domain + '/api/video';

    console.log('chooseCategory')

    if (category_name === '全部') {
      category_name = '品类'
    }
    
    const search = this.data.search;
		search._search = true;
		search.classify_id = '1,3';
		search.pageNum = 1;
    search.category_id = category_id;
    if (category_id == 0){
      delete search.category_id
    }
    const queryString = '';
    wx.showLoading({
      title: '加载中',
      mask: true
    });
		console.log(search)
    wx.request({
      url,
      data:search,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {

        res.data.data = res.data.data.map((d) => {
          // 判断用什么播放器播放
          if (d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          return d
        });
        wx.hideLoading();
        that.setData({
          videos: res.data.data,
          nzopen: false,
          isfull:false,
          shownavindex: 0,
          category_name,
          search
        });
      }
    });
  },


  chooseUsage: function (e) {
    const app = getApp();
    const domain = app.globalData.domain;
    let usage_id = e.currentTarget.dataset.id;
    let usage_name = e.currentTarget.dataset.name;
    if(usage_name === '全部'){
      usage_name = '功能'
    }
    const that = this;
		let url = domain + '/api/video';
    const search = this.data.search;
		search._search = true;
		search.classify_id = '1,3';
		search.pageNum = 1;
    search.usage_id = usage_id;
    if (usage_id == 0) {
      delete search.usage_id
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url,
      data: search,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {

        res.data.data = res.data.data.map((d) => {
          // 判断用什么播放器播放
          if (d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          return d
        });
        wx.hideLoading();
        that.setData({
          videos: res.data.data,
          pxopen: false,
          isfull: false,
          shownavindex:0,
          usage_name,
          search
        });
      }
    });
  }, 


  chooseStyle: function (e) {
    const app = getApp();
    const domain = app.globalData.domain;
    let style_id = e.currentTarget.dataset.id;
    const that = this;
		let url = domain + '/api/video/?_search=true&classify_id=1,3&style_id=' + style_id
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {

        res.data.data = res.data.data.map((d) => {
          // 判断用什么播放器播放
          if (d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          return d
        });
        wx.hideLoading();
        that.setData({
          videos: res.data.rows,
          stopen: false,
          isfull: false,
          shownavindex: 0
        });
      }
    });
  }, 

  tabClick: function (e) {
    const app = getApp();
    const domain = app.globalData.domain;
    let category_id = e.currentTarget.id;
    const that = this;
    let url;
    console.log('tabClick')
    if (category_id == 0) {
      url = domain + '/video/listByHot';
    } else {
			url = domain + '/api/video?_search=true&classify_id=1,3&category_id=' + category_id
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {

        res.data.data = res.data.data.map((d)=>{
          // 判断用什么播放器播放
          if (d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          return d
        });
        wx.hideLoading();
        that.setData({
          videos: res.data.data,
        });
      }

    });

    /*
    setTimeout(function () {
      console.log(e.currentTarget.id, e.currentTarget);
      var query = wx.createSelectorQuery();
      query.select(e.currentTarget.id).boundingClientRect(function (rect) {
        console.log(rect);
      }).exec();
    }, 100)
*/
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft + 28,
      activeIndex: e.currentTarget.id
    });
  },

  listqy: function (e) {
    if (this.data.qyopen) {
      this.setData({
        qyopen: false,
        nzopen: false,
        pxopen: false,
        stopen: false,
        nzshow: true,
        pxshow: true,
        qyshow: false,
        stshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        content: this.data.qy,
        qyopen: true,
        pxopen: false,
        nzopen: false,
        stopen: false,
        nzshow: true,
        pxshow: true,
        qyshow: false,
        stshow: true,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }

  },
  list: function (e) {
    if (this.data.nzopen) {
      this.setData({
        nzopen: false,
        pxopen: false,
        qyopen: false,
        stopen: false,
        nzshow: false,
        pxshow: true,
        qyshow: true,
        stshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        content: this.data.nv,
        nzopen: true,
        stopen: false,
        pxopen: false,
        qyopen: false,
        nzshow: false,
        pxshow: true,
        qyshow: true,
        stshow: true,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }
  },
  listst: function (e) {
    if (this.data.stopen) {
      this.setData({
        nzopen: false,
        pxopen: false,
        qyopen: false,
        stopen: false,
        nzshow: true,
        pxshow: true,
        stshow: false,
        qyshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        content: this.data.st,
        nzopen: false,
        pxopen: false,
        stopen: true,
        qyopen: false,
        nzshow: true,
        pxshow: true,
        qyshow: true,
        stshow: false,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }
  },
  listpx: function (e) {
    if (this.data.pxopen) {
      this.setData({
        nzopen: false,
        pxopen: false,
        qyopen: false,
        stopen: false,
        nzshow: true,
        pxshow: false,
        qyshow: true,
        stshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        content: this.data.px,
        nzopen: false,
        pxopen: true,
        qyopen: false,
        stopen: false,
        nzshow: true,
        pxshow: false,
        qyshow: true,
        stshow: true,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }
  },
  selectleft: function (e) {
    const search = this.data.search;
		search._search = true;
		search.classify_id='1,3'
		search.pageNum = 1;
    let platform_name = e.target.dataset.city;
    const that = this;

    //处理 全部的情况
    if (platform_name === '全部') {
      platform_name = '平台';
      delete search.platform_id;
      delete search.column_id;
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      const app = getApp();
      const domain = app.globalData.domain;
			let url = domain + '/api/video'
      wx.request({
        url,
        data: search,
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {

          res.data.data = res.data.data.map((d) => {
            // 判断用什么播放器播放
            if (d.url.indexOf('embed') !== -1) {
              d.url = d.url.match(/vid=([^&]+)/)[1];
              d.isqq = true;
            } else {
              d.isqq = false;
            }
            return d
          });
          wx.hideLoading();
          that.setData({
            videos: res.data.data,
            qyopen: false,
            qyshow: false,
            isfull: false,
            shownavindex: 0,
            search,
            platform_name
          });
        }
      });
    }else{
      this.setData({
        cityright: {},
        citycenter: this.data.cityleft[e.currentTarget.dataset.city],
        select1: e.target.dataset.city,
        select2: '',
        platform_name
      });
    }

  },
  selectcenter: function (e) {

    //当这边选择了全部，找上一级

    const app = getApp();
    const domain = app.globalData.domain;
    let column_id = e.currentTarget.dataset.id;
    let platform_name = e.currentTarget.dataset.name;
    let index = e.currentTarget.dataset.index;
    const search = this.data.search;
		search._search = true;
		search.classify_id='1,3'
		search.pageNum = 1;
    search.column_id = column_id;
    const that = this;
		let url = domain + '/api/video'
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    if (column_id == 0) {
      delete search.column_id;
      //设置plarform_id为上级
      search.platform_id = this.data.platforms.filter((plarform) => { return plarform.name === this.data.select1})[0]['id'];
      platform_name = this.data.select1
    }
    wx.request({
      url,
      data: search,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {

        res.data.data = res.data.data.map((d) => {
          // 判断用什么播放器播放
          if (d.url.indexOf('embed') !== -1) {
            d.url = d.url.match(/vid=([^&]+)/)[1];
            d.isqq = true;
          } else {
            d.isqq = false;
          }
          return d
        });
        wx.hideLoading();
        that.setData({
          videos: res.data.data,
          qyopen: false,
          qyshow: false,
          isfull: false,
          select2: index,
          shownavindex: 0,
          search,
          platform_name
        });
      }
    });

  },
  hidebg: function (e) {

    this.setData({
      qyopen: false,
      nzopen: false,
      pxopen: false,
      nzshow: true,
      pxshow: true,
      qyshow: true,
      isfull: false,
      shownavindex: 0
    })
  },
	onShareAppMessage: function () {

	},


});
