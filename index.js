// 引入所需模块
import { get } from 'https';
import { load } from 'cheerio';
import { existsSync, mkdirSync, writeFile } from 'fs';

import iconv from 'iconv-lite';
const { decode } = iconv;
// 定义爬取目标站
let baseUrl = 'https://www.ku137.net/';
let targetUrl = '/plus/search.php?q=%D1%EE%B3%BF%B3%BF';
let domSelector = '.m-list .cl li';
// 存放一会抓来的信息
let allPhotoPackUrl = [];

// 获取目标页面html内容
function getPageHtml(url) {
  console.log(url);
  return new Promise((resolve, reject) => {
    let chunks = [];
    get(baseUrl + url, (res) => {
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', async () => {
        let decodedBody = iconv.decode(Buffer.concat(chunks), 'gb2312');
        await filterHtmlData(decodedBody);
        resolve();
      });
    }).on('error', () => {
      console.error('获取数据出错！');
      reject();
    });
  });
}
// 图片下载函数
function download(url, name) {
  get(url, (res) => {
    let imgData = '';
    //设置图片编码格式
    res.setEncoding('binary');
    res.on('data', (chunk) => (imgData += chunk));
    res.on('end', () => {
      // 没有文件夹则创建 以防报错
      if (!existsSync('./images')) {
        mkdirSync('./images');
      }
      writeFile(`./images/${name}.jpg`, imgData, 'binary', (error) => {
        if (error) {
          console.error(`图片-${name}-下载异常！`);
        } else {
          console.log(`图片-${name}-下载成功！`);
        }
      });
    });
  });
}
// 过滤页面信息
async function filterHtmlData(htmlData) {
  if (htmlData) {
    let $ = load(htmlData, { decodeEntities: false });
    // 得到所需内容
    let filterContent = $(domSelector);
    filterContent.each(function () {
      let href = $('a', this).attr('href');
      allPhotoPackUrl.push(href);
    });
    $('.list .page a').each(function (index, elem) {
      if ($(this).text() == '下一页') {
        let nextPageHref = $(this).attr('href').replace('//', '/');
        if (nextPageHref) {
          setTimeout(() => {
            getPageHtml(nextPageHref);
          }, 5000);
        }
      }
    });
    // let nextPageDoms = $('.list .page a');
    // nextPageDoms.filter
    // let nextPageHref = nextPageDom.attr('href');
    // console.log(nextPageDom.length, nextPageHref);
    // if (nextPageHref) await getPageHtml(nextPageHref);
    // else console.log(allPhotoPackUrl, allPhotoPackUrl.length);
  }
}

getPageHtml(targetUrl);
