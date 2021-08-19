// pages/more/more.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    forceUseOldCanvas:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      forceUseOldCanvas:app.globalData.forceUseOldCanvas
    })
  },
  handleSwitchChange(e){
    app.globalData.forceUseOldCanvas = e.detail.value
    this.setData({
      forceUseOldCanvas:e.detail.value
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
})