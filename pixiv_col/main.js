const config = require('./config/index')
const request = require('superagent')
const fs = require('fs')
const cheerio = require('cheerio')
const exec = require('child_process').exec
let page = 1
let pageCurrentLength = 0
let pageMaxLength = 1
let total = 0

/**
 * 获取每一页的内容
 */
function getPageImgs() {
  pageCurrentLength = 0
  request
    .get(`https://www.pixiv.net/bookmark.php?rest=show&p=${page}`)
    .set('cookie', config.cookie)
    .set('referer', config.referer)
    .end((err, res) => {
      if(err) {
        console.log(err)
      }
      const result = res.text
      $ = cheerio.load(result)
      let thumbnails = $('._layout-thumbnail>img')
      let titles = $('a>h1.title')
      // 获取总页数
      if(!total) total = +$('.bookmark-tag-all')[0].firstChild.data.match(/\d+/)[0]

      pageMaxLength = thumbnails.length
      Array.from(thumbnails).forEach(async (thumbnail, index) => {
        let imgUrl = thumbnail.attribs['data-src']
        let imgFix = imgUrl.match(/\.\w+$/)[0]
        let imgTitle = titles[index].attribs.title
        let imgName = imgTitle + imgFix
        let originImgUrl = imgUrl.replace(/\/c\/150x150\/img-master(.*?)_master1200/, '/img-original$1')

        checkLinkStatus({ imgTitle, imgName, originImgUrl }, index)
      })
    })
}

function checkLinkStatus({ imgTitle, imgName, originImgUrl }, index) {
  request.head(originImgUrl)
    .set('cookie', config.cookie)
    .set('referer', config.referer)
    .end((err, res) => {
      if(err) {
        let originImgUrlFix = originImgUrl.match(/\.\w+$/)[0]
        let png = '.png'
        let jpg = '.jpg'
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
  let stream = fs.createWriteStream(`./pixiv_col/imgs/${imgName.replace(/\//g, '')}`)
  let req = request.get(originImgUrl)
      .set('cookie', config.cookie)
      .set('referer', config.referer)

  req.pipe(stream)

  req.on('end', () => {
    console.log(pageCurrentLength + pageMaxLength * page - pageMaxLength + 1 + '/' + total)
    if(++pageCurrentLength >= pageMaxLength) {
      getPageImgs(++page)
      exec(`echo ${pageCurrentLength} >> pixiv_col/length.txt;echo ${page} >> pixiv_col/page.txt`)
    }
  })
}

getPageImgs()