const config = require('./config/index')
const superagent = require('superagent')
const fs = require('fs')
const cheerio = require('cheerio')
// start page
let page = 1
  , pageCurrentLength = 0
  , pageMaxLength = 1

function restart() {
  pageCurrentLength = 0
  // if(page > 2) return
  superagent
    .get(`https://www.pixiv.net/bookmark.php?rest=show&p=${page}`)
    .set('cookie', config.cookie)
    .set('referer', config.referer)
    .end((err, res) => {
      if(err) {
        console.log(err)
      }
      const result = res.text
      $ = cheerio.load(result)
      let thumbnails = $('._layout-thumbnail>img'),
        titles = $('a>h1.title')

      pageMaxLength = thumbnails.length
      Array.from(thumbnails).forEach(async (thumbnail, index) => {
        // if(index) return
        let imgUrl = thumbnail.attribs['data-src']
          , imgFix = imgUrl.match(/\.\w+$/)[0]
          , imgTitle = titles[index].attribs.title
          , imgName = imgTitle + imgFix
          , originImgUrl = imgUrl.replace(/\/c\/150x150\/img-master(.*?)_master1200/, '/img-original$1')

        checkLinkStatus({ imgTitle, imgName, originImgUrl }, index)
      })
    })
}

function checkLinkStatus({ imgTitle, imgName, originImgUrl }, index) {
  superagent.head(originImgUrl)
    .set('cookie', config.cookie)
    .set('referer', config.referer)
    .end((err, res) => {
      if(err) {
        let originImgUrlFix = originImgUrl.match(/\.\w+$/)[0]
          , png = '.png'
          , jpg = '.jpg'
        if(originImgUrlFix === png) {
          imgName = imgTitle + jpg
          originImgUrl = originImgUrl.replace(/\.\w+$/, jpg)
        }
        else {
          imgName = imgTitle + png
          originImgUrl = originImgUrl.replace(/\.\w+$/, png)
        }
      }
      setTimeout(downloadFile.bind(null, { imgTitle, imgName, originImgUrl }), config.timeout * index);
    })
}

function downloadFile({ imgTitle, imgName, originImgUrl }) {
  // ignore '/' error
  let stream = fs.createWriteStream(`./pixiv/imgs/${imgName.replace(/\//g, '')}`)

    , req = superagent.get(originImgUrl)
      .set('cookie', config.cookie)
      .set('referer', config.referer)

  req.pipe(stream)

  req.on('end', () => {
    if(++pageCurrentLength >= pageMaxLength) restart(++page)
  })
}

restart()