// 油猴

(function() {
  'use strict';

  // Your code here...

  // 链接列表
  let list = []

  // 点开超链接后再点击...
  let start_btn = `
    <button onclick="patchListPluginStart()" style="position: fixed; top: 120px; right: 120px; z-index: 9999;background-color: white; padding: 8px; 16px">开始</button>
`
  let end_ele = `
    <textarea id="result_text_area" style="position: fixed; top: 200px; right: 120px; z-index: 9999;background-color: white; padding: 8px; 16px"></textarea>
`
  document.body.insertAdjacentHTML('afterend', start_btn)

  window.patchListPluginStart = function start() {
    console.log('start')
    patch()
  }

  window.patchListPluginEnd = function end() {
    document.body.insertAdjacentHTML('afterend', end_ele)
    document.querySelector('#result_text_area').value = JSON.stringify(list)
    console.log('end list length: ' + list.length)
  }

  function patch() {
    // 下一页按钮
    let next_ctrl = getNextPageCtrl()
    // 获取a标签
    let as = getAs()
    // 获取标题, 可选
    let titles = getTitles()
    as.forEach(function(a, idx) {
      // 除链接外其他处理 start
      if(titles[idx].innerText.includes('B站')) {
        list.push(a.href)
      }
      // end
    })
    console.log('list length: ' + list.length)

    // 有页码则翻页
    if(document.querySelector('.weui-desktop-pagination__num')) {
      let current_page = $('.weui-desktop-pagination__num')[0].innerText
      let max_page = $('.weui-desktop-pagination__num')[1].innerText
      // 当前页码等于最大页码则结束
      if(current_page === max_page) {
        patchListPluginEnd()
        return
      } else {
        // 点击下一页事件
        if(next_ctrl) {
          next_ctrl.click()
          // 延时2s后开始采集并插入列表
          setTimeout(function() {
            patch()
          }, 2000)
        }
      }
    } else { // 没页码直接结束
      patchListPluginEnd()
      return
    }
  }

  // 获取下一页按钮
  function getNextPageCtrl() {
    let as = document.querySelectorAll('.weui-desktop-btn.weui-desktop-btn_default.weui-desktop-btn_mini')
    // 第一页只有一个下一页
    return as[1] || as[0]
  }

  // 获取当前列表的a标签
  function getAs() {
    return document.querySelectorAll('.weui-desktop-vm_default a')
  }

  // 获取标题
  function getTitles(){
    return document.querySelectorAll('.inner_link_article_title')
  }
})()
