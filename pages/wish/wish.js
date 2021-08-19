// pages/wish/wish.js
import util from '../../utils/util.js'
import wishUtil from '../../utils/wishUtil.js'
import service from '../../api/service.js'
const app = getApp()

const MAX_WISH_COUNT = 600
const WISH_TYPES = [301, 302, 200]
const getInitWishResult = ()=>({
  301: {
    title: '角色活动祈愿',
    count: 0,
    maxWish: 90,
    purple: {
      weaponCount: 0,
      roleCount: 0
    },
    gold: {
      weaponList: [],
      roleList: []
    }
  },
  302: {
    title: '武器活动祈愿',
    maxWish: 80,
    count: 0,
    purple: {
      weaponCount: 0,
      roleCount: 0
    },
    gold: {
      weaponList: [],
      roleList: []
    }
  },
  200: {
    title: '常驻活动祈愿',
    maxWish: 90,
    count: 0,
    purple: {
      weaponCount: 0,
      roleCount: 0
    },
    gold: {
      weaponList: [],
      roleList: []
    }
  },
})

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wishLogLink: '',
    wishLinkTextareaFocus: false,
    linkMaxLength: 3000,
    themeColor: app.globalData.themeColor,

    maxCount: MAX_WISH_COUNT,
    pageRowSize: 20,
    page: 1,
    showModal: false,
    isAnalysisCompleted: false,
    wishType: WISH_TYPES[0],
    wishResult: getInitWishResult(),
    startSearchTimestamp:'',
  },

  handleWishLogLinkInput: function (e) {
    const {
      detail
    } = e
    const {
      value
    } = detail
    this.setData({
      wishLogLink: value
    })
  },
  handleWishLinkCellTap: function (e) {
    this.setData({
      wishLinkTextareaFocus: true
    })
  },
  handleTutorial: function (e) {
    wx.navigateTo({
      url: '/pages/tutorial/tutorial',
    })
  },
  handleAnalysisAllWishDone: function () {
    const taht = this
    wx.setStorage({
      key: "globalWishResult",
      data: JSON.stringify(this.data.wishResult),
      success: function () {
        taht.resetAnalysisStatus()
        taht.goWishResult()
      },
      fail: function (error) {
        console.error(error);
        wx.showToast({
          title: '存储祈愿信息失败，请重试',
          duration: 2000
        })
        taht.resetAnalysisStatus()
      }
    })
  },
  resetAnalysisStatus: function () {
    this.setData({
      showModal: false,
      isAnalysisCompleted: true,
      wishType: WISH_TYPES[0],
      wishResult: getInitWishResult(),
      page: 1
    })
  },
  getWishResultByNewPageData: function (data, wishType) {
    //分析存储当前页数据
    const thisPageOneWishResult = wishUtil.parseWishRecord(data)
    const result = this.data.wishResult
    let targetTypeWishResult = {...result[wishType]}
    targetTypeWishResult = wishUtil.mergeWishRecord(targetTypeWishResult, thisPageOneWishResult)
    const { startTime, endTime } = wishUtil.getStartAndLastTime(data)
    if(startTime){
      targetTypeWishResult.startTime = startTime
    }
    if(endTime){
      targetTypeWishResult.endTime = endTime
    }
    result[wishType] = targetTypeWishResult
    return result
  },
  asyncSetDataByTimestamp:function(data,timestamp){
    //if(timestamp===this.data.startSearchTimestamp) 后续有异步问题再使用时间戳
    this.setData(data)
  },
  handleAnalysisWishSuccess: function (resData, requstParams) {
    const {
      data,
      retcode
    } = resData
    if(!data || retcode<0){
      wx.showToast({
        title: `请求出错：${data.message}`,
        icon:'none',
        duration: 2000
      })
    }
    const {
      list,
      size,
      page
    } = data
    const numSize = parseInt(size)
    const numPage = parseInt(page)
    const {
      requestUrl,
      wishParams
    } = requstParams
    const _wishParams = {
      ...wishParams
    }
    const { thisSearchTimestamp } = _wishParams
    const wishType = this.data.wishType
    if (list.length < numSize || list.length === 0 || numPage * numSize >= this.data.maxCount) { //1.最后一页记录 2.超过最大查询限制
      const index = WISH_TYPES.indexOf(wishType)
      const result = this.getWishResultByNewPageData(data, wishType)
      if (index === WISH_TYPES.length - 1) { //最后一种祈愿类型已经查找完毕
        this.asyncSetDataByTimestamp(
          {
            wishResult: result
          },
          thisSearchTimestamp
        )
        this.handleAnalysisAllWishDone()
      } else { //查找下一种类型
        const nextWishType = WISH_TYPES[index + 1]
        console.info('查找下一种类型', nextWishType)
        this.asyncSetDataByTimestamp(
          {
            page: 1,
            wishResult: result,
            wishType: nextWishType
          },
          thisSearchTimestamp
        )
        this.requestWishHistory(requestUrl, _wishParams, {
          type: nextWishType,
          endId: 0,
          page: 1
        })
      }
      return
    }
    const lastItem = list[list.length - 1]
    const {
      id
    } = lastItem
    const result = this.getWishResultByNewPageData(data, wishType)
    this.asyncSetDataByTimestamp(
      {
        page: numPage + 1,
        wishResult: result
      },
      thisSearchTimestamp
    )
    // 继续请求下一页的数据
    this.requestWishHistory(requestUrl, _wishParams, {
      type: wishType,
      endId: id,
      page: numPage + 1
    })
  },
  handleAnalysisWishFail: function (error) {
    console.error(error)
    this.setData({
      showModal: false,
      isAnalysisCompleted: true
    })
    wx.showToast({
      title: `请求出错：${JSON.stringify(error)}`,
      icon:'none',
      duration: 2000
    })
  },
  goWishResult: function () {
    wx.navigateTo({
      url: '/pages/wishResult/wishResult?navTitle=祈愿记录分析',
      fail: function (res) {
        console.error(res.errMsg)
      }
    })
  },
  requestWishHistory: function (requestUrl, wishParams, {
    type,
    endId,
    page
  }) {
    wishParams.gacha_type = type
    wishParams.end_id = endId // 上次请求最后一个记录的id,第一次为0
    wishParams.page = page
    setTimeout(() => {//随机事件发送
      if (this.data.isAnalysisCompleted) {
        console.info('查询中断')
        return
      }
      service.syncGet(requestUrl, wishParams, {}).then(
        (resData) => {
          this.handleAnalysisWishSuccess(resData, {
            requestUrl,
            wishParams
          })
        }
      ).catch(error => {
        this.handleAnalysisWishFail(error)
      })
    }, Math.floor(Math.random() * 500)+100)
  },
  handleAnalysisWish: function (e) {
    if (!this.data.wishLogLink) {
      wx.showToast({
        title: '链接不能为空',
        icon: 'error',
        duration: 2000
      })
      return
    }
    const thisSearchTimestamp = (new Date()).valueOf()
    this.setData({
      showModal: true,
      isAnalysisCompleted: false,
      wishResult: getInitWishResult(),
      startSearchTimestamp: thisSearchTimestamp,
    })
    try {
      const {
        query
      } = util.parseUrl(this.data.wishLogLink)
      const queryParamsObj = util.parseQueryParams(query)
      const {
        game_biz
      } = queryParamsObj
      const hostApiPrefix = game_biz.split('_')[0]
      const requestUrl = util.structureRequestUrl(hostApiPrefix)
      const wishParams = {
        ...queryParamsObj,
        size: this.data.pageRowSize,
        thisSearchTimestamp,
      }
      this.requestWishHistory(requestUrl, wishParams, {
        type: WISH_TYPES[0],
        endId: 0,
        page: 1,
      })

    } catch (error) {
      console.error(`[handleAnalysisWish]: ${error}`)
      this.setData({
        showModal: false,
        isAnalysisCompleted: true
      })
      wx.showToast({
        title: '链接格式有误，请按照教程复制链接',
        icon: 'none',
        duration: 3000
      })
    }
  },
  handlePageRowSizeChanged: function (e) {
    this.setData({
      pageRowSize: e.detail.value
    })
  },
  handleMaxCountChanged: function (e) {
    this.setData({
      maxCount: e.detail.value
    })
  },
  handleCancelAnalysis: function (e) {
    this.resetAnalysisStatus()
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