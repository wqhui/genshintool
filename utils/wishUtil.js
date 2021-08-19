// const MOCK_WISH_RECORD = {
//   page: '1',
//   size: '6',
//   total: '0',
//   list: [{
//     uid: '112398436',
//     gacha_type: '301',
//     item_id: '',
//     count: '1',
//     time: '2021-03-07 21:44:25',
//     name: '铁影阔剑',
//     lang: 'zh-cn',
//     item_type: '武器',
//     rank_type: '3',
//     id: '1615122360000681424'
//   }, {
//     uid: '112398436',
//     gacha_type: '302',
//     item_id: '',
//     count: '1',
//     time: '2021-03-07 21:44:25',
//     name: '莫娜',
//     lang: 'zh-cn',
//     item_type: '角色',
//     rank_type: '5',
//     id: '1615122360000681422'
//   }, {
//     uid: '112398436',
//     gacha_type: '302',
//     item_id: '',
//     count: '1',
//     time: '2021-03-07 21:44:25',
//     name: '绝世好剑',
//     lang: 'zh-cn',
//     item_type: '武器',
//     rank_type: '5',
//     id: '1615122360000681422'
//   }, {
//     uid: '112398436',
//     gacha_type: '301',
//     item_id: '',
//     count: '1',
//     time: '2021-03-13 14:41:57',
//     name: '重云',
//     lang: 'zh-cn',
//     item_type: '角色',
//     rank_type: '4',
//     id: '1615615560000609699'
//   }
//   ],
//   region: 'cn_gf01'
// }

function parseWishRecord(wishRecord) {
  let result = {
    count: 0,
    purple: {
      weaponCount: 0,
      roleCount: 0
    },
    gold: {
      weaponList: [],
      roleList: []
    }
  }
  const {
    list, page, size
  } = wishRecord
  if (list.length === 0) {
    return result
  }
  const _page = parseInt(page)
  const _size = parseInt(size)
  const preWishCount = _page === 1 ? 0 : (_page - 1) * _size
  result.count = list.length
  result = list.reduce((pre, item, index) => {
    const {
      rank_type, item_type, name, uid
    } = item
    if (rank_type === '5') { // 5星
      const targetObj = result.gold
      const targetList = item_type === '角色' ? targetObj.roleList : targetObj.weaponList
      targetList.push({
        name, item_type, uid, whichWish: preWishCount + index + 1
      })
    } else if (rank_type === '4') { // 4星
      const targetObj = result.purple
      if (item_type === '角色') {
        targetObj.roleCount += 1
      } else {
        targetObj.weaponCount += 1
      }
    }
    return pre
  }, result)
  return result
}

function mergeWishRecord(totalRecord, nextRecord) {
  const _totalRecord = { ...totalRecord }
  _totalRecord.count += nextRecord.count
  const purpleWeaponCount = _totalRecord.purple.weaponCount != null ? _totalRecord.purple.weaponCount : 0
  const nextPurpleWeaponCount = nextRecord.purple.weaponCount != null ? nextRecord.purple.weaponCount : 0
  _totalRecord.purple.weaponCount = purpleWeaponCount + nextPurpleWeaponCount

  const purpleRoleCount = _totalRecord.purple.roleCount != null ? _totalRecord.purple.roleCount : 0
  const nextPurpleRoleCount = nextRecord.purple.roleCount != null ? nextRecord.purple.roleCount : 0
  _totalRecord.purple.roleCount = purpleRoleCount + nextPurpleRoleCount

  _totalRecord.gold.weaponList = _totalRecord.gold.weaponList.concat(nextRecord.gold.weaponList)
  _totalRecord.gold.roleList = _totalRecord.gold.roleList.concat(nextRecord.gold.roleList)
  return _totalRecord
}

// /**
//  * 比较时间
//  * @param {*} mons 几个月
//  * @param {*} startTime 
//  * @param {*} endTime 
//  */
// function isOutTime(mons, startTime, endTime){
//   const st  = new Date(startTime);
//   const et = new Date(endTime);
//   const stNextMonN=new Date(st);
//   stNextMonN.setMonth(stNextMonN.getMonth()+mons);
  
//   if(et.getTime()>stNextMonN.getTime()){
// 　　　　return true;
//   }
// 　return false;
// }

// function getCurrentTime(){
//   let now = new Date();
//   now.setDate(now.getDate() + 1); //多加一天当做diff
//   return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
// }
function quickSort(arr, getSortValue){
  getSortValue = getSortValue ? getSortValue : item => item //兼容对象数组的情况 item => item.witch
  if (arr.length <= 1) {
		return arr;
  }
 	//取基准点
  const midIndex = Math.floor(arr.length / 2);
  const midItemArr = arr.splice(midIndex,1) //删除原数组的中间值, 返回是一个数组
  const midVal = getSortValue(midItemArr[0])
  const left = []; //存放比基准点小的数组
  const right = []; //存放比基准点大的数组
  
  	//遍历数组，进行判断分配
	for (let i = 0; i < arr.length; i++) {
		if (getSortValue(arr[i]) < midVal) {
			left.push(arr[i]); //比基准点小的放在左边数组
		} else {
			right.push(arr[i]); //比基准点大的放在右边数组
		}
  }
  
  // 左边concat基准值，确保右边不会有两个一样的值，否则会死循环，跟上面的判断有关
  return quickSort(left,getSortValue).concat(midItemArr,quickSort(right,getSortValue))
}

function getWishRecordAnalysisByWishResult(totalRecord) {
  const { count, purple, gold, maxWish, title, startTime, endTime } = totalRecord
  const { weaponList, roleList } = gold
  const { weaponCount, roleCount } = purple
  let lastGoldWhichWish = 0 // 最近一抽五星
  let goldList = weaponList.concat(roleList)
  if (weaponList.length > 0 || roleList.length > 0) {
    goldList = quickSort(goldList,item=>item.whichWish)
    goldList = goldList.reduce((pre, gold, index) => { // 计算该五星相比上个花了多少抽
      const { whichWish } = gold
      const preGold = goldList[index + 1]
      let whichWishAfterPreviousGold
      if(preGold){
        whichWishAfterPreviousGold = preGold.whichWish - whichWish
      } else if(goldList.length===1){
        whichWishAfterPreviousGold = whichWish
      }else{
        whichWishAfterPreviousGold = count - whichWish
      }
      gold.whichWishAfterPreviousGold = whichWishAfterPreviousGold
      pre.push(gold)
      return pre
    }, [])
  }
  if (goldList.length > 0) {
    const lastGold = goldList[0]
    lastGoldWhichWish = lastGold.whichWish
  }
  return {
    count,
    goldWeaponCount: weaponList.length,
    goldRoleCount: roleList.length,
    purpleWeaponCount: weaponCount,
    purpleRoleCount: roleCount,
    lastGoldWhichWish,
    title,
    startTime,
    endTime,
    maxWish,
    goldList
  }
}

function getStartAndLastTime(wishRecord) {
  const {
    list, page
  } = wishRecord
  const result = {}
  if (list.length === 0) {
    return result
  }
  if (page === '1') {
    const firstWish = list[0]
    result.endTime = firstWish.time
  }
  const lastWish = list[list.length - 1]
  result.startTime = lastWish.time
  return result
}

// function test() {
//   let initTotalRecord = {
//     count: 0,
//     purple: {
//       weaponCount: 0,
//       roleCount: 0
//     },
//     gold: {
//       weaponList: [],
//       roleList: []
//     }
//   }

//   initTotalRecord = mergeWishRecord(initTotalRecord, parseWishRecord(MOCK_WISH_RECORD))
//   initTotalRecord.gold.roleList = [{ name: '莫娜', item_type: '角色', uid: '112398436', whichWish: 3 },
//   { name: '莫娜', item_type: '角色', uid: '112398436', whichWish: 14 }]
//   initTotalRecord.gold.weaponList = [{ name: '武器1', item_type: '武器', uid: '112398436', whichWish: 12 },
//   { name: '武器2', item_type: '武器', uid: '112398436', whichWish: 74 }]
//   const result = getWishRecordAnalysisByWishResult(initTotalRecord)
//   const { startTime, ednTime } = getStartAndLastTime(MOCK_WISH_RECORD)
// }



module.exports = {
  parseWishRecord,
  mergeWishRecord,
  getWishRecordAnalysisByWishResult,
  getStartAndLastTime
}