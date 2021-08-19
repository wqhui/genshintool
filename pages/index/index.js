// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    tools: [
      {
        name: '祈愿记录分析',
        path: '/pages/wish/wish'
      },
      {
        name: '祈愿记录分析历史',
        path: '/pages/wishResult/wishResult'      
      }
    ]
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
})
