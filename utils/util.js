const HTTPS = 'https://'
const API_SUFFIX = '-api.mihoyo.com/event/gacha_info/api/getGachaLog'

const structureRequestUrl = (gameBiz) => {
  let url = HTTPS
  url += gameBiz
  url += API_SUFFIX
  return url
}

/**
 * 
 * @param {String} url  eg:https://webstatic.mihoyo.com/hk4e/event/e20190909gacha/index.html
 */
const parseUrl = (url) => {
  const reg = /(\w+):\/\/([\w\.]+)\:?(\d*)?([\/\.\w]*)?\??([^#]*)?#?(\S*)?/
  var mattchGroup = url.match(reg)
  const result = {}

  result.protocol = mattchGroup[1]
  result.host = mattchGroup[2]
  result.port = mattchGroup[3] || 80
  result.path = mattchGroup[4]
  result.query = mattchGroup[5] || ''
  result.hash = mattchGroup[6] || ''

  return result
}

const parseQueryParams = (urlQuery) => {
  let params = {}
  const paramsGroup = urlQuery.split('&')
  for (let item of paramsGroup) {
    const paramsItemGroup = item.split('=')
    if (paramsItemGroup && paramsItemGroup.length > 0) {
      let paramValue = paramsItemGroup[1]
      paramValue = paramValue.replace(/%2B/gi,'+')
      paramValue = paramValue.replace(/%20/gi,' ')
      paramValue = paramValue.replace(/%2F/gi,'/')
      paramValue = paramValue.replace(/%3F/gi,'?')
      paramValue = paramValue.replace(/%25/gi,'%')
      paramValue = paramValue.replace(/%26/gi,'&')
      paramValue = paramValue.replace(/%3D/gi,'=')
      paramValue = paramValue.replace(/%23/gi,'#')
      params[paramsItemGroup[0]] = paramValue
    }
  }
  return params
}


module.exports = {
  structureRequestUrl,
  parseQueryParams,
  parseUrl
}