
---
### 自己紹介
**名前**：ゆうき
**仕事**：現在Webの受託開発企業で主にvue書いてます

![alt](LT_IMAGE/my_image.JPG)

---
### 何を作ったのか
サーバレスで画像アップロード掲示板

---
### なぜ？
- 正直掲示板を使ったことがなく、どういう機能が必要なのかのイメージがつかなかったから |
- 単純な興味本意 |
- 地獄の始まり |

---
### どんなものを作ったのか
URL: https://yuuki-aws-dev.work

---
### 参考サイト: 
このきなんの木掲示板
![alt](LT_IMAGE/konokinannoki.png)
---?image=LT_IMAGE/nayami.jpeg
### 5週間やってみて

- １−4週間が壊滅的に進まなかった |

---
### 原因

そこには多くの壁があった(進まなかった要因)
- どんなものを作るのかのイメージができない |
- どうやって開発したらいいのかのイメージがつかない |
-  予期せぬ請求... |

---
### 途中で本を買いました
![alt](LT_IMAGE/aws-serverless-book.jpg)

---
### 2000円の請求

---
### そんなこんなで道のりは長かった
---?image=LT_IMAGE/kanikeijiban.jpeg
### 設計
---
### 悩んだ部分

---
### dynamodbの設計
```json
{
  "id": 1,
  "text": "posttext",
  "comments": [
    {
      "postId": 1,
      "comment": "hogehoge"
    },
    {
      "postId": 2,
      "comment": "hogehoge2"
    }
  ]
}
```
- list_append関数で実現可能
---
### しかしcommentの更新ができない
comments配列にあるidはわかるがindexがわからない。。
更新したい箇所 = comments[i].idが一致するobject

---
### 修正!!!
しかもこうすることで作成、更新、削除全てがputメソッドでできるようになった。
```json
{
  "id": 1,
  "text": "posttext",
  "comments": {
    "1": {
      "comment": "hogehoge"
    },
    "2": {
      "comment": "hogehoge2"
    }
  }
}
```

---
### 気付き

5週間で終わりです！終わったらLTがあります！<br>
これぐらい追い込まないとやる気にがでない。<br>
のでまたいずれやると思います笑

---
### よかったらまたご参加ください。ありがとうございました。