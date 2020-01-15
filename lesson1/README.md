# Service Worker
## 什么是 Service Worker
1. 可以进行 拦截和处理网络请求/推送通知/后台同步
2. 他是一种 JavaScript Worker 通过另一个线程进行工作
3. 可编程的网络代理, 能让你控制页面发送网络请求的处理方式
4. 在不用时会被终止，并在下次有需要时重启
5. 可以访问 IndexedDB API
## 条件：
1. 浏览器支持
2. 需要 https /支持 localhost 使用
## 注册 Service Worker
需要通过页在页面中对其进行注册来启动安装。告诉浏览器 Service Worker JavaScript 文件的位置
```
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      console.log('success');
      console.log('registration);
    }).catch(function (err) {
      console.log('fail');
      console.log(err);
    })
  })
}
```
检查 Service Worker API 是否可用，如果可用，则在页面加载后注册位于`/sw.js`的Service Worker。

每次页面加载无误时，即可调用`register()`浏览器将会判断服务工作线程是否已注册并作出相应的处理。

## 安装 Service Worker
在受控页面启动注册流程后，我们需要在`install`事件执行以下步骤
1. 打开缓存。
2. 缓存文件
3. 确认所有需要的资产是否已缓存
```
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('opened cache');
        return cache.add.All(urlsToCache);
      })
  )
})
```
我们需要缓存名称调用`caches.open()`,之后再调用`cache.addAll()`并传入文件数组。这是一个promise链(`caches.open()`和`cache.addAll()`)。`event.waitUntil()`方法带有promise参数并使用它来判断安装所花费的时间，以及安装是否成功

如果所有文件都成功缓存，则安装Service Worker。如果有任何文件无法下载，则安装步骤将失败。

## 缓存和返回请求
在安装 Service Worker 之后，就需要一个缓存的响应，当用户转至其他页面或刷新当前页面后，Service Worker 将开始接收`fetch`事件
```
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(ebent.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  )
})
```
这里定义了`fetch`事件，并且在`event.respondWith()`中，我们传入来自`caches.match()`的一个promise。此方法检视该请求，并从服务工作线程所创建任何缓存中查找缓存的结果。

如果发现匹配的响应，则返回缓存的值，否则，将调用`fetch`以发出网络请求，并将网络检索到的任何数据作为结果返回。

如果希望连续缓存新请求，可以通过处理`fetch`请求的响应并将其添加到缓存来实现
```
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function (fetchRequest) {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        )
      })
  )
})
```
这里克隆响应的原因在于，该响应是数据流，因此主体只能使用一次。由于我们想要返回能被浏览器使用的响应，并将其传递到缓存以供使用，因此需要克隆一份副本

我们可以通过转至`chrome://inspect/#service-workers`并寻找注册的网站来检查Service Worker是否启用