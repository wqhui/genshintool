// components/tool-item/tool-item.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    name:String,
    path:String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleToolItemTap:function(e){
      wx.navigateTo({
        url: this.data.path,
        fail:function(res){
          console.error(res.errMsg)
        }
      })
    }
  }
})
