# Spider

## install

`npm i` or `yarn`

## run

### alibaba sort

set Cookie in ali_sort/config/index.js

`touch ali_sort/config.js`

set like this in it:

```js
module.exports = {
  host: 'localhost',
  port: 8000,
  // 登录try.taobao.com后开发控制台复制cookie, 下面示例cookie不保证可用性
  cookie: 'your_cookie'
}
```

`npm run as`

#### open

browser open [http://localhost:3000/](http://localhost:3000/)

### pixiv collection

set Cookie in pixiv/config/index.js

`npm run pc`
