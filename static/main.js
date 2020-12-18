'use strict';
const IMG_SIZE_LIMIT = 1024 * 1024 * 1; // 制限サイズ
const URL = 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test/api';
const postData = {};

document.addEventListener('DOMContentLoaded', iniLoad)
file.addEventListener('change', handleFileSelect);
button.addEventListener('click', formSubmit);

async function iniLoad() {
  try {
    // body: JSON.stringify(postData),しないといけない
    const res = await axios.get(`${URL}/posts`);
    res.data.forEach(post => {
      const imgContents = post.imageURL ? `<img src="${post.imageURL}" alt="画像" />` : `<p>画像はありません</p>`;
      output.innerHTML += `
        <p>id: ${post.id}</p>
        <p>name: ${post.name}</p>
        <div>${post.text}</div>
        <p>作成日: ${japanDate(post.date)}</p>
        ${imgContents}
        <button>更新</button>
        <button>削除</button>
      `;
    });
  } catch (err) {
    console.log('err', err);
  }
}



// 画像ファイルをアップロードする
function handleFileSelect() {
  const files = file.files;
  if (files[0].size > IMG_SIZE_LIMIT) {
    // ファイルサイズが制限以上
    alert('ファイルサイズは1MB以下にしてください'); // エラーメッセージを表示
    file.value = ''; // inputの中身をリセット
    return; // この時点で処理を終了する
  }
  previewFile(files[0]);
}

// 画像記事を送信する時
async function formSubmit(e) {
  e.preventDefault();
  const name = document.getElementsByName('name')[0].value;
  const text = document.getElementsByName('text')[0].value;
  if (!name || !text) {
    alert('名前/テキストが空白です');
    return;
  }
  postData.name = name;
  postData.text = text;
  // ファイルデータ
  try {
    console.log('front end postData = ', postData);
    // body: JSON.stringify(postData),しないといけない
    await axios.post(`${URL}/posts`, postData);
    file.value = ''; // inputの中身をリセット
    console.log('front end res = ', res);
  } catch (err) {
    console.log('err', err);
  }
}

// 画像をプレビューする
function previewFile(file) {
  // プレビュー画像を追加する要素
  const preview = document.getElementById('preview');
  // FileReaderオブジェクトを作成
  const reader = new FileReader();
  // URLとして読み込まれたときに実行する処理
  reader.onload = function (e) {
    const imageUrl = e.target.result; // URLはevent.target.resultで呼び出せる
    const parts = imageUrl.split(';');
    postData.mime = parts[0].split(':')[1];
    postData.name = file.name;
    postData.image = parts[1];
    const img = document.createElement("img"); // img要素を作成
    img.src = imageUrl; // URLをimg要素にセット
    img.id = 'imgData';
    // もしもうファイルがあったらデータを削除
    while (preview.firstChild) {
      preview.removeChild(preview.firstChild);
    }
    preview.appendChild(img); // #previewの中に追加
  }

  reader.readAsDataURL(file);
}

function japanDate(dataTime) {
  const date = new Date(dataTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDay();
  const hours = date.getHours();
  const minites = date.getMinutes();
  return `${year}年${month}月${day}日${hours}時${minites}分`;
}

