# 使用

* 配置config.js

```js
module.exports = {
  // 书籍章节列表url
  url: 'http://www.89wxw.cn/0/524/',
  // 书名
  name: '放开那个女巫',
  // 多久抓取一次, 单位毫秒, 建议大于30000
  time: 30000,
}
```

* `npm run 89wxw` 项目根目录运行

  > pm2: `pm2 start npm -n 89wxw -- run 89wxw`

* 然后就可以在data/书名.txt里面获取到啦, 哈哈哈哈