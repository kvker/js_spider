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
      .post(
        `https://try.taobao.com/api3/call?what=show&page=${paylaod.page}&pageSize&api=x%2Fsearch`
      )
      .set(
        'cookie',
        'thw=cn; t=74021fce0e6d9f2bb3d869515759de99; cna=4hkiFL4juGcCAX14Et5PY1hH; hng=CN%7Czh-CN%7CCNY%7C156; tracknick=oshri; lgc=oshri; tg=0; enc=eNDvgOIko5GVYjIRuZWAw2dMANrTcpq0ZozZ%2BmzbMf6PDuGMAlIxfIN7PFn%2BGz9lOJzt6diUjONXDhcYwf4GWQ%3D%3D; mt=ci=60_1&np=; v=0; cookie2=1cf8688fea9d2b7109b34351130eb1ea; _tb_token_=f0b8e7443eb7e; unb=438035375; sg=i53; _l_g_=Ug%3D%3D; skt=11e3df671f46b67e; cookie1=VASo1QwArXdiRIpDqIIZnmkAdms%2F4BUn1xU6bp7Ul7A%3D; csg=5f1ab1e6; uc3=vt3=F8dByRmvlknZIoUV7H4%3D&id2=Vy%2BXKuBsrhov&nk2=DMKkEBc%3D&lg2=URm48syIIVrSKA%3D%3D; existShop=MTUzOTQ5NzI0MA%3D%3D; _cc_=W5iHLLyFfA%3D%3D; dnk=oshri; _nk_=oshri; cookie17=Vy%2BXKuBsrhov; uc1=cookie14=UoTfItRYLgB%2FVg%3D%3D&lng=zh_CN&cookie16=U%2BGCWk%2F74Mx5tgzv3dWpnhjPaQ%3D%3D&existShop=true&cookie21=URm48syIZJwcbRls5W9cyg%3D%3D&tag=10&cookie15=VT5L2FSpMGV7TQ%3D%3D&pas=0; _mw_us_time_=1539616630485; isg=BAIC-Hgg7Rlaz_GnQw_HsoHaUw6kew-HVX6J8UwbLnUgn6IZNGNW_YjZS9tGz36F'
      )
      .set('referer', 'https://try.taobao.com')
      .set('x-csrf-token', 'f0b8e7443eb7e')
      .end((err, sres) => {
        // handle normal error
        if (err) {
          return next(err)
        }
        const result = JSON.parse(sres.text).result
        resolve(result)
      })
  })
}

app.get('/total', async (req, res) => {
  const result = await postPage()
  res.send({pages: result.paging.pages})
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

const hostInfo = require('./config/hostInfo')
app.listen(hostInfo.port, hostInfo.host, function() {
  console.log('please open: http://' + hostInfo.host + ':' + hostInfo.port)
})
