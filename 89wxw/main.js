const fs = require('fs')
const path = require('path')
const superagent = require('superagent')
const charset = require('superagent-charset')
const cheerio = require('cheerio')
const request = charset(superagent)
const config = require('./config')
const express = require('express')
const cp = require('child_process')
// 一小时重置一次
setTimeout(() => {
  cp.exec('pm2 restart 89wxw')
}, 60 * 60 * 1000)

const app = express()

let total_length = 1
let current_length
let save_progress = 0
try {
  save_progress = Number(fs.readFileSync(`89wxw/progress`))
  current_length = save_progress
} catch (error) {
  current_length = 0
}
console.log({current_length})

app.get('/progress', (req, res) => {
  res.json({
    current_length,
    total_length,
    progress: (current_length / total_length).toFixed(2),
  })
})

app.listen(4800, () => {
  console.log('spider run in: ' + 'http://localhost:4800')
})

loadRoot(config.url, config.name)

async function loadRoot(url, name) {
  if(url.trim().length && url.startsWith('http')) {
    try {
      let ret = await request.get(url).charset('gbk')
      // console.log(ret.text)
      const $ = cheerio.load(ret.text)
      // console.log($('dd > a').text())
      let titles = $('#list dd > a')
      let pages = titles.map(function(idx) {
        return {
          label: $(this).text(),
          href: $(this).attr('href'),
        }
      }).get()
      total_length = pages.length
      let i = 0
      for(const page of pages) {
        if(i < save_progress) {
          i++
          continue
        }
        await downloadContent(page.href, page.label)
        current_length++
        i++
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    throw new Error('非法链接')
  }
}

function downloadContent(path, title) {
  return new Promise(async (resolve, reject) => {
    let ret = await request.get('http://www.89wxw.cn' + path).charset('gbk')
    const $ = cheerio.load(ret.text)
    let content = `
    ${title}

    ${$('#content').text()}

    --------------------------------------------------------------------------------------------------------------

  `
    fs.appendFileSync(`89wxw/data/${config.name}.txt`, content)
    fs.writeFileSync(`89wxw/progress`, current_length)
    setTimeout(() => {
      resolve()
    }, config.time)
  })
}