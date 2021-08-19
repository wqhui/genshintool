
function get(url, data, { header, onSuccess, onFail }) {
    wx.request({
        url: url,
        data: data,
        header: header || {'content-type': 'application/json'}, 
        method: 'get',
        responseType: 'text',
        success(res) {
            onSuccess && onSuccess(res.data)
        },
        fail(error) {
            console.error(error)
            onFail && onFail(error)
        }
    })
}

function syncGet(url, data, { header }){
    return new Promise((resolve,reject)=>{
        return get(url, data,{header,onSuccess:resolve,onFail:reject})
    })
}


// const mockData = {
//     1:{"retcode":0,"message":"OK","data":{"page":"1","size":"6","total":"0","list":[{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-13 14:41:57","name":"讨龙英杰谭","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615615560000609703"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-13 14:41:57","name":"飞天御剑","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615615560000609702"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-13 14:41:57","name":"冷刃","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615615560000609701"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-13 14:41:57","name":"黎明神剑","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615615560000609700"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-13 14:41:57","name":"重云","lang":"zh-cn","item_type":"角色","rank_type":"4","id":"1615615560000609699"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-13 14:41:57","name":"沐浴龙血的剑","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615615560000609698"}],"region":"cn_gf01"}},
//     2:{"retcode":0,"message":"OK","data":{"page":"2","size":"6","total":"0","list":[{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-07 21:44:25","name":"神射手之誓","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615122360000681426"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-07 21:44:25","name":"弹弓","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615122360000681425"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-07 21:44:25","name":"铁影阔剑","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615122360000681424"},{"uid":"112398436","gacha_type":"301","item_id":"","count":"1","time":"2021-03-07 21:44:25","name":"讨龙英杰谭","lang":"zh-cn","item_type":"武器","rank_type":"3","id":"1615122360000681423"},{"uid":"112398436","gacha_type":"302","item_id":"","count":"1","time":"2021-03-07 21:44:25","name":"莫娜","lang":"zh-cn","item_type":"角色","rank_type":"5","id":"1615122360000681422"}],"region":"cn_gf01"}}
// }

// function mockSyncGet(url, data, { header }){
//     return new Promise((resolve,reject)=>{
//         const {page} = data
//         console.log(111,'mockSyncGet',data)
//         setTimeout(()=>{
//             resolve(mockData[page]) 
//         },1000)
//     })
// }


module.exports = {
    get,
    syncGet
}