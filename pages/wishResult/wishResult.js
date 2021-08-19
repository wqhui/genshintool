import * as echarts from '../../ec-canvas/echarts';
import wishUtil from '../../utils/wishUtil.js'

const app = getApp();
const WISH_TYPES = [301, 302, 200]
const CHART_ITEM_LIST = [{
  color: app.globalData.purpleColor1,
  name: '四星武器'
},
{
  color: app.globalData.purpleColor2,
  name: '四星角色'
},
{
  color: app.globalData.goldColor1,
  name: '五星武器'
},
{
  color: app.globalData.goldColor2,
  name: '五星角色'
}
]

function initChart(canvas, width, height, dpr, params) {
  const {
    goldWeaponCount,
    goldRoleCount,
    purpleWeaponCount,
    purpleRoleCount
  } = params
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  const dataList = []
  const colorList = []
  const list = [purpleWeaponCount, purpleRoleCount, goldWeaponCount, goldRoleCount]
  list.forEach((value, index) => {
    if (value > 0) {
      const item = CHART_ITEM_LIST[index]
      dataList.push({
        name: item.name,
        value
      })
      colorList.push(item.color)
    }
  })


  var option = {
    backgroundColor: "#FFFFFF",
    color: colorList,
    series: [{
      label: {
        normal: {
          formatter: '{b}\n{c}个\n{d}%',
          fontSize: 12
        }
      },
      type: 'pie',
      radius: '50%',
      center: ['50%', '50%'],
      data: dataList
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    isEmpty: false,
    wishRecordAnalysisList: [
      // {
      //   ec: {
      //     onInit: initChart
      //   },
      //   count: 4,
      //   maxWish:90,
      //   goldWeaponCount: 2,
      //   goldRoleCount: 2,
      //   purpleWeaponCount: 0,
      //   purpleRoleCount: 1,
      //   lastGoldWhichWish: 3,
      //   goldList:
      //    [ { name: '莫娜',
      //        item_type: '角色',
      //        uid: '112398436',
      //        whichWish: 3,
      //        whichWishAfterPreviousGold: 9 },
      //      { name: '武器1',
      //        item_type: '武器',
      //        uid: '112398436',
      //        whichWish: 12,
      //        whichWishAfterPreviousGold: 2 },
      //      { name: '莫娜',
      //        item_type: '角色',
      //        uid: '112398436',
      //        whichWish: 14,
      //        whichWishAfterPreviousGold: 60 },
      //      { name: '武器2',
      //        item_type: '武器',
      //        uid: '112398436',
      //        whichWish: 74,
      //        whichWishAfterPreviousGold: -70 } 
      //     ] 
      // }
    ],
    showActions: false,
    forceUseOldCanvas: getApp().globalData.forceUseOldCanvas
  },
  onLoad(options) {
    const { navTitle = '祈愿记录分析历史' } = options || {}
    wx.setNavigationBarTitle({
      title: navTitle
    })
    this.setData({
      forceUseOldCanvas:getApp().globalData.forceUseOldCanvas
    })
  },
  onReady() {
    try {
      const value = wx.getStorageSync('globalWishResult')
      console.log(11,value)
      if (value) {
        const wishReuslt = JSON.parse(value)
        const wishRecordAnalysisList = this.transfromWishReusltToData(wishReuslt)
        let isEmpty = true
        let i = 0
        while (i < wishRecordAnalysisList.length && isEmpty) {
          i++
          if (wishRecordAnalysisList[i] && wishRecordAnalysisList[i].count > 0) {
            isEmpty = false
          }
        }
        this.setData({
          wishRecordAnalysisList,
          isEmpty
        })
      } else {
        this.setData({
          isEmpty: true
        })
      }
    } catch (e) {
      console.error(e)
    }
  },
  transfromWishReusltToData(wishReuslt) {
    return WISH_TYPES.map((key => {
      const item = wishReuslt[key]

      const rItem = wishUtil.getWishRecordAnalysisByWishResult(item)
      const {
        purpleRoleCount,
        purpleWeaponCount,
        goldWeaponCount,
        goldRoleCount
      } = rItem
      const ec = {
        onInit: function (canvas, width, height, dpr) {
          initChart(canvas, width, height, dpr, {
            goldWeaponCount,
            goldRoleCount,
            purpleWeaponCount,
            purpleRoleCount
          })
        }
      }
      rItem.ec = ec
      return rItem
    }))
  },
  handleToAnalysisWish() {
    wx.redirectTo({
      url: '/pages/wish/wish'
    })
  },
  /**
  * 分享转发
  */
 onShareAppMessage: function () {
   return app.globalData.defaultShareDetail
 },
 /**
  * 分享到朋友圈
  */
 onShareTimeline: function () {
   return app.globalData.defaultShareDetail
 },
});