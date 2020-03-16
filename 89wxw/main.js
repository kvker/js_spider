const fs = require('fs')
const path = require('path')
const superagent = require('superagent')
const charset = require('superagent-charset')
const cheerio = require('cheerio')
const request = charset(superagent)
const config = require('./config')
const express = require('express')
const cp = require('child_process')
// 一小时重置一次,防爬虫或广告导致
setTimeout(() => {
  cp.exec('pm2 restart 89wxw')
}, 60 * 60 * 1000)

const app = express()

// 总进度
let total_length = 1
// 当前进度
let current_progress
// 本地保存的进度
let save_progress = 0
try {
  save_progress = Number(fs.readFileSync(`89wxw/progress`))
  current_progress = save_progress
} catch(error) {
  current_progress = 0
}
console.log({ current_progress })

// 服务器提供外网查看的接口
app.get('/progress', (req, res) => {
  res.json({
    current_progress,
    total_length,
    progress: (current_progress / total_length).toFixed(2),
  })
})

// 进度监控网站
app.listen(4800, () => {
  console.log('spider run in: ' + 'http://localhost:4800')
})

// 加载文章章节
loadRoot(config.url, config.name)

/**
 * 加载文章章节, 处理章节列表
 * @param {string} url 文章章节地址
 */
async function loadRoot(url) {
  if(url.trim().length && url.startsWith('http')) {
    try {
      let ret = await request.get(url).charset('gbk')
      // console.log(ret.text)
      const $ = cheerio.load(ret.text)
      // 解析目录
      let titles = $('#list dd > a')
      // 目录返回的页面标题和地址
      let pages = titles.map(function(idx) {
        return {
          label: $(this).text(),
          href: $(this).attr('href'),
        }
      }).get()
      // 总章节数
      total_length = pages.length
      let i = 0
      // 异步遍历获取章节内容
      for(const page of pages) {
        if(i < save_progress) {
          i++
          continue
        }
        current_progress++
        //  下载内容到本地
        await downloadContent(page.href, page.label)
        i++
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    throw new Error('非法链接')
  }
}

/**
 * 下载追加到本地
 * @param {string} path 章节内容地址
 * @param {string} title 章节标题
 */
function downloadContent(path, title) {
  return new Promise(async (resolve, reject) => {
    try {
      let ret = await request.get('http://www.89wxw.cn' + path).charset('gbk')
      const $ = cheerio.load(ret.text)
      let content = `
        ${title}

        ${$('#content').text()}

        --------------------------------------------------------------------------------------------------------------

      `
      fs.appendFileSync(`89wxw/data/${config.name}.txt`, content)
      fs.writeFileSync(`89wxw/progress`, current_progress)
      setTimeout(() => {
        resolve()
      }, config.time)
    } catch(error) {
      let content = `
        ${title}

        章节挂了

        --------------------------------------------------------------------------------------------------------------

      `
      fs.appendFileSync(`89wxw/data/${config.name}.txt`, content)
      reject(error)
    }
  })
}