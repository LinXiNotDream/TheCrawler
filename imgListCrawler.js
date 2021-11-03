import { get } from 'https'
import { load } from 'cheerio'
import { baseUrl } from './config.js'
import iconv from 'iconv-lite'
const { decode } = iconv

let targetUrl = '/plus/search.php?q=%D1%EE%B3%BF%B3%BF'
let allPhotoPackUrl = []

// 获取目标页面html内容
function getPageHtml(url) {
  console.log(url)
  return new Promise((resolve, reject) => {
    let chunks = []
    get(baseUrl + url, (res) => {
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', async () => {
        let decodedBody = decode(Buffer.concat(chunks), 'gb2312')
        await filterHtmlData(decodedBody)
        resolve()
      })
    }).on('error', () => {
      console.error('获取数据出错！')
      reject()
    })
  })
}

async function filterHtmlData(htmlData) {
  if (htmlData) {
    let $ = load(htmlData, { decodeEntities: false })
    // 得到所需内容
    let filterContent = $('.m-list .cl li')
    filterContent.each(function () {
      let href = $('a', this).attr('href')
      allPhotoPackUrl.push(href)
    })
    // 判断是否有下一页
    let haveNextPage = false
    $('.list .page a').each(function (index, elem) {
      if ($(this).text() == '下一页') {
        let nextPageHref = $(this).attr('href').replace('//', '/')
        if (nextPageHref) {
          haveNextPage = true
          setTimeout(() => {
            // 添加延时，因为此网站频繁操作会挂掉
            getPageHtml(nextPageHref)
          }, 10 * 1000)
        }
      }
    })
    if (!haveNextPage) console.log(allPhotoPackUrl)
  }
}

getPageHtml(targetUrl)
