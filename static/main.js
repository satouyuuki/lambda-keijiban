'use strict';
const IMG_SIZE_LIMIT = 1024 * 1024 * 1; // 制限サイズ
const URL = 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test/api';
const postData = {};
const file = document.getElementById('file');
const keijibanForm = document.forms.keijibanForm;
document.addEventListener('DOMContentLoaded', iniLoad)
file.addEventListener('change', handleFileSelect);
keijibanForm.addEventListener('submit', formSubmit);

async function iniLoad() {
  try {
    const res = await axios.get(`${URL}/posts`);
    res.data.forEach(post => {
      createPostData(post);
    });
  } catch (err) {
    console.log('err', err);
  }
}

async function deletePost(val) {
  try {
    console.log();
    const id = val.dataset.id;
    const fileName = val.dataset.img;
    console.log({ id, fileName });
    await axios.delete(`${URL}/posts/${id}`, { data: { fileName }});
    const delElement = document.getElementById(id);
    delElement.remove();
  } catch (err) {
    console.log('err', err);
  }
}

function createPostData(post) {
  const query = `?id=${post.id}`;
  const imageObject = {};
  if (post.imageURL) {
    imageObject.text = `<img src="${post.imageURL}" alt="画像" />`
    const array = post.imageURL.split('/');
    imageObject.fileName = array[array.length - 1];
  } else {
    imageObject.text = '<p>画像はありません</p>';
    imageObject.fileName = '';
  }
  // const imgContents = post.imageURL ? `<img src="${post.imageURL}" alt="画像" />` : `<p>画像はありません</p>`;
  output.innerHTML += `
    <div id="${post.id}">
      <p>name: ${post.name}</p>
      <div class="textarea-div">${post.text}</div>
      <p>作成日: ${japanDate(post.date)}</p>
      <a href="./detail.html${query}">${imageObject.text}</a>
      <button>更新</button>
      <button data-id="${post.id}" data-img="${imageObject.fileName}" onclick="deletePost(this)">削除</button>
    </div>
  `;
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
  try {
    const formData = new FormData(keijibanForm);
    for (let value of formData.entries()) {
      if (value[0] !== 'file') {
        postData[value[0]] = value[1];
      }
    }
    // ファイルデータ
    const res = await axios.post(`${URL}/posts`, postData);
    // フォームをリセット
    document.keijibanForm.reset();
    const newPost = res.data;
    createPostData(newPost);
  } catch (err) {
    console.log('err', err);
  }
}

// Fileオブジェクトの中身を整形する
function customFileData(imageUrl) {
  const parts = imageUrl.split(';');
  const mime = parts[0].split(':')[1];
  const image = parts[1];
  return { mime, image };
}

// 画像をプレビューする
function previewFile(file) {
  const preview = document.getElementById('preview');
  const reader = new FileReader();
  reader.onload = function (e) {
    const imageUrl = e.target.result;
    Object.assign(postData, customFileData(imageUrl));
    const img = document.createElement("img");
    img.src = imageUrl;
    img.id = 'imgData';
    // もしもうファイルがあったらデータを削除
    while (preview.firstChild) {
      preview.removeChild(preview.firstChild);
    }
    preview.appendChild(img); // #previewの中に追加
  }
  reader.readAsDataURL(file);
}
// 描画する日付を整形
function japanDate(dataTime) {
  const date = new Date(dataTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDay();
  const hours = date.getHours();
  const minites = date.getMinutes();
  return `${year}年${month}月${day}日${hours}時${minites}分`;
}

