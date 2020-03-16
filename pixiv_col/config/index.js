const cookie = require('./cookie')

module.exports = {
  host: 'localhost',
  port: 8000,
  // 多久一张
  timeout: 3000,
  // 自行填充
  cookie,
  // 下面不用改
  referer: 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=70108489',
}
