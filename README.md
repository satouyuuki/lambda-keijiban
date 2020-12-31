## 画像アップロード掲示板
```
ユーザー用: https://yuuki-aws-dev.work
管理者用: https://admin.yuuki-aws-dev.work
```

### 構成図
![aws構成図](LT_IMAGE/kanikeijibanv3.png)

## どんなことができる？
- 画像のアップロード※画像となまえは必須ではない
- 編集・削除をするには自分で設定したパスワードが必要

### ローカル環境
```
yarn: v1.22.4
node: v12.1.0
serverless 2.12.0
```

## 使用技術

### インフラ
- lambda(node v12)
  - api gatewayを通してdynamodbにデータを送信する
  - s3に画像をアップロード(CRUD処理)
- s3
  - webホスティング(ユーザ用と管理者用)
  - 画像をアップロードする
- api gateway(adminはauthorizer)
- dynamodb
- cognito(User PoolとId Pool)
  - 管理者ページの認証と認可を担当
- route53
  - URL: yuuki-aws-dev.work(ユーザー用)
  - URL: admin-aws-dev.work(管理者用)
- cloudfront
  - s3のwebホスティングをSSL化

* dbスキーマ
```
id: string(uuid)
date: number(UTC時間)
name: string(指定がなかった場合は[名無し])
text: string
comments: object
  {
    id: {
      comment:string
      date: number(UTC時間)
      name: string(指定がなかった場合は[名無し])
    }
  }
password: string(更新と削除をする時に必ず必要)
imageURL: string(S3のURL)
cookieFlag: string(cookieを指定するかどうか)
```

- フロントエンド

HTML/Javascript/css
webpack: 難読化/パフォーマンス向上のため

### 課題
- cookieのパスワードをハッシュ化する
- lambdaとフロントエンドをTypescriptにする
- コメントも削除と更新ができるようにする
- ページネーションが必要

### 問題点
- webpackにした瞬間テンプレートリテラルの中のonclickがエラーになった。addEventListenerにする対応をする