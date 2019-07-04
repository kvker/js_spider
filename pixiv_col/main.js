const config = require('./config/index')
const request = require('superagent')
const fs = require('fs')
const cheerio = require('cheerio')
const exec = require('child_process').exec
let page = 23
let pageCurrentLength = 0
let pageMaxLength = 1
let total = 0

// 清空上次记录
exec(`> pixiv_col/progress.txt`)
exec(`echo ${new Date().toLocaleString()} > pixiv_col/progress.txt`)

/**
 * cookie配置在：./config/index.js -> cookie后面的引号内
 * 获取方式，登录Pixiv后，打开控制台刷新查看NetWork->Doc里面的.php后缀请求，找到Request相关，里面有cookie，复制来就行
 *
 * 请自行配置你的cookie！！！
 * 请自行配置你的cookie！！！
 * 请自行配置你的cookie！！！
 * 请自行配置你的cookie！！！
 * 请自行配置你的cookie！！！
 * 请自行配置你的cookie！！！
 * 请自行配置你的cookie！！！
 */

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
      // 加载为伪JQ
      $ = cheerio.load(result)
      let thumbnails = $('._layout-thumbnail>img')
      let titles = $('a>h1.title')
      // 获取总页数
      if(!total) total = +$('.bookmark-tag-all')[0].firstChild.data.match(/\d+/)[0]

      pageMaxLength = thumbnails.length
      Array.from(thumbnails).forEach((thumbnail, index) => {
        let imgUrl = thumbnail.attribs['data-src']
        let imgFix = imgUrl.match(/\.\w+$/)[0]
        let imgTitle = titles[index].attribs.title
        let imgName = imgTitle + imgFix
        let originImgUrl = imgUrl.replace(/\/c\/150x150\/img-master(.*?)_master1200/, '/img-original$1')

        checkLinkStatus({ imgTitle, imgName, originImgUrl })
      })
    })
}

function checkLinkStatus({ imgTitle, imgName, originImgUrl }) {
  request.head(originImgUrl)
    .set('cookie', config.cookie)
    .set('referer', config.referer)
    .end((err, res) => {
      // 那啥，缩略图跟实际大小图，后缀不一定一样，你可以自己浏览几张看看就知道了
      if(err) {
        let originImgUrlFix = originImgUrl.match(/\.\w+$/)[0]
        let png = '.png'
        let jpg = '.jpg'
        if(originImgUrlFix === png) {
          imgName = imgTitle + jpg
          originImgUrl = originImgUrl.replace(/\.\w+$/, jpg)
        } else {
          imgName = imgTitle + png
          originImgUrl = originImgUrl.replace(/\.\w+$/, png)
        }
      }
      // 每三秒处理一张，别太急，容易出问题。。。比如，封号
      downloadFile({ imgTitle, imgName, originImgUrl })
    })
}

function downloadFile({ imgName, originImgUrl }) {
  let stream = fs.createWriteStream(`./pixiv_col/imgs/${imgName.replace(/\//g, '')}`)
  let req = request.get(originImgUrl)
    .set('cookie', config.cookie)
    .set('referer', config.referer)

  req.pipe(stream)

  req.on('end', () => {
    // 有兴趣看控制台的可以保留下面一行不注释
    let downloadsLength = pageCurrentLength + 20 * (page - 1)
    exec(`echo ${downloadsLength}/${total} --- ${imgName} --- >> pixiv_col/progress.txt`)

    // 超过当前页数的数量，就进行下一页
    if(++pageCurrentLength >= pageMaxLength) {
      // 保存进度日志，随便写的，想咋玩，自行完善下
      exec(`echo ---- page${page++} have done!!! ---- >> pixiv_col/progress.txt`)
      getPageImgs()
    }
  })
}

getPageImgs()