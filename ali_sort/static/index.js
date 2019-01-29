let currentPage = 0 // 当前页面
let allItems = [] // 全部数据
let currentTime = 0 // 锁频率使用，标记上次时间
const xhr = new XMLHttpRequest()
const loopInterval = 2 // 锁频率步长，单位秒
const results = document.querySelector('#results')
const currentPageText = document.querySelector('#currentPage')
const reFullTBody = arr => {
  let innerHtml = ''
  arr.forEach((item, i) => {
    item.rate = item.totalNum / item.requestNum * 100
    let tr = `
    <tr onclick="window.open('https://try.taobao.com/item.htm?id=${item.id}')">
      <td>${i + 1}</td>
      <td>${item.rate.toFixed(3) + '%'}</td>
      <td>${item.title}</td>
      <td><div class="img-box"><img src="${item.pic}"/></div></td>
      </tr>
      `
      if (item.rate > 5) tr = tr.replace('<tr', '<tr class="warning"')
        innerHtml += tr
  })
  currentPageText.innerText = `当前页：${currentPage}`
  results.innerHTML = innerHtml
}

const postPage = () => {
  // 锁频率步长内取消请求
  const newTime = new Date().getTime()
  const shoudBack = newTime - currentTime < loopInterval * 1000
  if(shoudBack) {
    alert(loopInterval + '秒内不要多次点击哦。')
    return
  }
  currentTime = newTime
  xhr.onreadystatechange = function() {
    if(this.readyState === 4 && this.status === 200) {
      const res = JSON.parse(this.response)
      if(res.length < 1) {
        alert('今天结束的已经筛选完了')
        return
      }
      allItems = [...allItems, ...res]
      allItems.sort((a, b) => b.rate - a.rate)
      reFullTBody(allItems)
      currentPage--
    }
  }
  xhr.open('post', '/table')
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  //发送请求
  xhr.send("page=" + currentPage)
}

xhr.onreadystatechange = function() {
  if(this.readyState === 4 && this.status === 200) {
    currentPage = JSON.parse(this.response).pages
    postPage()
  }
}
xhr.open('get', '/total')
xhr.send()
