const express = require('express')
// 调用 express 实例，它是一个函数，不带参数调用时，会返回一个 express 实例，将这个变量赋予 app 变量。
const superagent = require('superagent')
// const cheerio = require('cheerio')
const fs = require('fs')
const app = express()
let currentPage = 1 // 当前索引的 page
// let times = 0 // 请求多少次了，因为获取总页数会执行一次，所以从零开始
// const maxTimes = 40 // 最多请求次数
// const total = []
// const minInterval = 5 // 最小请求间隔，防封
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))

function postPage(paylaod = {}) {
  return new Promise((resolve, rej) => {
    superagent
      .post(
        `https://try.taobao.com/api3/call?what=show&page=${paylaod.page}&pageSize&api=x%2Fsearch`
      )
      .set(
        'user-agent',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      )
      // .set(':authority', 'try.taobao.com')
      // .set(':method', 'POST')
      // .set(':path', '/api3/call?what=show&page=1&pageSize&api=x%2Fsearch')
      // .set(':scheme', 'https')
      .set('accept', 'pplication/json, text/javascript, */*; q=0.01')
      .set('accept-encoding', 'gzip, deflate, br')
      .set(
        'accept-language',
        'zh-CN,zh;q=0.9,en;q=0.8,la;q=0.7,zh-TW;q=0.6,da;q=0.5'
      )
      // .set('content-length', '8')
      .set('content-type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .set(
        'cookie',
        'thw=cn; t=74021fce0e6d9f2bb3d869515759de99; cna=4hkiFL4juGcCAX14Et5PY1hH; hng=CN%7Czh-CN%7CCNY%7C156; tracknick=oshri; lgc=oshri; tg=0; enc=eNDvgOIko5GVYjIRuZWAw2dMANrTcpq0ZozZ%2BmzbMf6PDuGMAlIxfIN7PFn%2BGz9lOJzt6diUjONXDhcYwf4GWQ%3D%3D; mt=ci=60_1&np=; v=0; cookie2=1cf8688fea9d2b7109b34351130eb1ea; _tb_token_=f0b8e7443eb7e; unb=438035375; sg=i53; _l_g_=Ug%3D%3D; skt=11e3df671f46b67e; cookie1=VASo1QwArXdiRIpDqIIZnmkAdms%2F4BUn1xU6bp7Ul7A%3D; csg=5f1ab1e6; uc3=vt3=F8dByRmvlknZIoUV7H4%3D&id2=Vy%2BXKuBsrhov&nk2=DMKkEBc%3D&lg2=URm48syIIVrSKA%3D%3D; existShop=MTUzOTQ5NzI0MA%3D%3D; _cc_=W5iHLLyFfA%3D%3D; dnk=oshri; _nk_=oshri; cookie17=Vy%2BXKuBsrhov; uc1=cookie14=UoTfItRYLgB%2FVg%3D%3D&lng=zh_CN&cookie16=U%2BGCWk%2F74Mx5tgzv3dWpnhjPaQ%3D%3D&existShop=true&cookie21=URm48syIZJwcbRls5W9cyg%3D%3D&tag=10&cookie15=VT5L2FSpMGV7TQ%3D%3D&pas=0; _mw_us_time_=1539616630485; isg=BAIC-Hgg7Rlaz_GnQw_HsoHaUw6kew-HVX6J8UwbLnUgn6IZNGNW_YjZS9tGz36F'
      )
      .set('origin', 'https://try.taobao.com')
      .set('referer', 'https://try.taobao.com')
      .set('x-csrf-token', 'f0b8e7443eb7e')
      .set('x-requested-with', 'XMLHttpRequest')
      .end((err, sres) => {
        // 常规的错误处理
        if (err) {
          return next(err)
        }
        // times ++
        // currentPage --
        // 随机秒
        // const random = (~~(Math.random() * 10) + minInterval) * 1000
        const result = JSON.parse(sres.text).result
        // setTimeout(() => {
        //   resolve(result)
        // }, random)
        resolve(result)
      })
  })
}

app.get('/', (req, res) => {
  fs.readFile('index.html', 'utf-8', (err, f) => {
    res.send(f)
  })
})

app.get('/total', async (req, res) => {
  const result = await postPage()
  res.send({pages: result.paging.pages})
})

app.post('/table', async (req, res, next) => {
  console.log(req.body)
  const result = await postPage({
    page: req.body.page
  })

  res.send(result.items.map(item => ({
    ...item,
    rate: item.totalNum / item.requestNum * 100
  })))
  // let items = []
  // for(let i = 0; i++ < 3;) {
  //   const result = await postPage()
  //   items = items.concat(result.items)
  // }
  // const currentTime = new Date().getTime()
  // items.filter(i => {
  //   return i.endTime - currentTime < 86400000
  // }) // 一天内结束
  // const newItems = items.map(i => ({
  //   rate: i.totalNum / i.requestNum * 100,
  //   id: i.id
  // }))
  // newItems.sort((a, b) => b.rate - a.rate)
  // res.send(newItems)
})

const hostInfo = require('./hostInfo')
app.listen(hostInfo.port, hostInfo.host, function() {
  console.log(hostInfo.host + ':' + hostInfo.port)
})
