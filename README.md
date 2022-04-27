# xxbook

此專案為 elasticsearch 與 react 學習用途, 主要使用:

- typescript: next, nest
- python 文本分析

Roadmap:

- [x] 支援亮色與暗色系切換
- [ ] 小說分析資料，用作前情提要功能與搜尋功能
  - [x] 人名次數統計
  - [ ] 關鍵句
  - [ ] 關鍵詞
- [ ] 搜尋支援書本與章節兩種搜尋
  - [ ] 書本搜尋
  - [ ] 章節搜尋
  - [ ] 針對人名進行 weight 調整
- [ ] 左側 menu drawer
  - [ ] 最近瀏覽記錄 - 應以書本做 group, 但第一版簡單章節
  - [ ] 訂閱書本 最新章節顯示
  - [ ] 推薦書本
- [ ] 書本介紹頁
  - [ ] SSG
  - [ ] 快速試閱功能(類似遊戲裡對話風格)
- [ ] 主頁面功能
  - [x] SSG
  - [x] 最新更新章節
  - [ ] 熱門書籍
- [ ] 章節頁面功能
  - [x] 大小
  - [x] SSR
  - [x] Infinite scroll(基於 intersection obsever)
  - [x] Infinite scroll 自動變更 url 與記錄正確 restore scroll 位置
  - [ ] 搜尋功能額外增加當前書本章節內容搜尋

## dev

nestjs

```bash
npm run dev:nest
```

nextjs

```bash
npm run dev:next
```

## heroku depoly

heroku init

```shell
heroku stack:set container --app yourAppName
```

build & push & release nestjs api server

```shell
docker build -t registry.heroku.com/yourAppName/web -f ./Dockerfile.nest .
docker push registry.heroku.com/yourAppName/web
heroku container:release web --app yourAppName
```

build & push & release next server

```shell
API_PROXY=http://yourNest.herokuapp.com
```

```shell
# --network host maybe for SSG
docker build --network host -t registry.heroku.com/yourAppName/web -f ./Dockerfile.next .
docker push registry.heroku.com/yourAppName/web
heroku container:release web --app yourAppName
```

## Issues

1. nextjs 12 breaking change nest-next 導致無法 mono, 目前拆分會造成 nextjs image 過大問題(無區分 next 專用 dependencies), 但 runtime memory 不影響
2. getServerSideProps 斷點無效
