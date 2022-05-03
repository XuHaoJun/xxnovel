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
  - [x] 前端儲存搜尋歷史，基於 rxdb，可及時同步多分頁/視窗
  - [x] title autocomplete
  - [x] 書本搜尋
  - [ ] 章節搜尋
  - [ ] 針對人名進行 weight 調整, 根據人名出現次數做二次的加權
  - [ ] 動態增加當前書本章節內容搜尋
- [ ] 左側 menu drawer
  - [x] 最近瀏覽記錄。以天做區分，一天以內只會更新時間，不會新增一筆搜尋記錄，可及時同步多分頁/視窗
  - [ ] 訂閱書本 最新章節顯示
  - [ ] 推薦書本
- [ ] 書本介紹頁
  - [x] SSG
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

## Requirement

1. nodejs 16.x
2. elasticsearch 7.x
3. xxhnalp

## dev

install

```
yarnn install --freezon-lockfile
```

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

## git update public dir

only keep one version static files!

backup your next public/ to another place

[How to remove a directory from git repository?](https://stackoverflow.com/questions/6313126/how-to-remove-a-directory-from-git-repository/56140096#56140096)

```bash
# remove old versions of public/
git filter-branch --index-filter 'git rm -rf --cached --ignore-unmatch public/' --prune-empty --tag-name-filter cat -- --all
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
rm -Rf .git/logs .git/refs/original
git gc --prune=all --aggressive

git add public && git commit -m 'new public/'
git push origin --all --force
git push origin --tags --force
```

## Issues

1. nextjs 12 breaking change nest-next 導致無法 mono, 目前拆分會造成 nextjs image 過大問題(無區分 next 專用 dependencies), 但 runtime memory 不影響
2. getServerSideProps 斷點無效
3. Module not found: Can't resolve '@material-ui/??? [@see](https://github.com/rjsf-team/react-jsonschema-form/commit/b25cb60efdc3818bc5bf4a3789829fefc0083f60)
