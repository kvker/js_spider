const config = require('./config/index')
const express = require('express')
const path = require('path')
const superagent = require('superagent')
const app = express()
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, './')))

function postPage(paylaod = {}) {
  return new Promise(resolve => {
    superagent
      .post(`https://try.taobao.com/api3/call?what=show&page=${paylaod.page}&pageSize&api=x%2Fsearch`)
      .set('cookie', config.cookie)
      .set('referer', 'https://try.taobao.com')
      .set('x-csrf-token', '7e885ad0b4833')
      .end((err, sres) => {
        // handle normal error
        if(err) {
          return next(err)
        }
        const result = JSON.parse(sres.text).result
        resolve(result)
      })
  })
}

app.get('/total', async (req, res) => {
  const result = await postPage()
  res.send({ pages: result.paging.pages })
})

app.post('/table', async (req, res) => {
  const result = await postPage({
    page: req.body.page
  })
  const items = result.items
  const currentTime = new Date().getTime()
  // end in one day
  items.filter(i => {
    return i.endTime - currentTime < 86400000
  })

  res.send(items.map(item => ({
    ...item,
    rate: item.totalNum / item.requestNum * 100
  })))
})

app.listen(config.port, config.host, function() {
  console.log('please open: http://' + config.host + ':' + config.port)
})
