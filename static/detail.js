'use strict';
// const IMG_SIZE_LIMIT = 1024 * 1024 * 1; // 制限サイズ
const URL = 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test/api';
const ID = decodeURI(window.location.search).split('=')[1];
const postData = {};
// const file = document.getElementById('file');
const keijibanForm = document.forms.keijibanForm;
document.addEventListener('DOMContentLoaded', iniLoad)
// file.addEventListener('change', handleFileSelect);
keijibanForm.addEventListener('submit', formSubmit);

async function iniLoad() {
  try {
    const res = await axios.get(`${URL}/posts/${ID}`);
    console.log(res);
    // res.data.forEach(post => {
    createPostData(res.data);
    // });
  } catch (err) {
    console.log('err', err);
  }
}

function createPostData(post) {
  const imgContents = post.imageURL ? `<img src="${post.imageURL}" alt="画像" />` : `<p>画像はありません</p>`;
  output.innerHTML += `
    <p>id: ${post.id}</p>
    <p>name: ${post.name}</p>
    <div class="textarea-div">${post.text}</div>
    <p>作成日: ${japanDate(post.date)}</p>
    ${imgContents}
    <button>更新</button>
    <button>削除</button>
  `;
  createCommentData(post.comments);
}
function createCommentData(comments) {
  console.log('comments = ', comments);
  const cloneComments = Object.assign({}, comments);
  if (Object.keys(cloneComments).length) {
    console.log(Object.keys(cloneComments));
    Object.keys(cloneComments).forEach(commentID => {
      const comment = cloneComments[commentID];
      output.innerHTML += `
        <p>id: ${commentID}</p>
        <p>名前: ${comment.name}</p>
        <p>コメント: ${comment.comment}</p>
        <p>作成日: ${japanDate(comment.date)}</p>
      `;
    })
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
  try {
    const formData = new FormData(keijibanForm);
    for (let value of formData.entries()) {
      // if (value[0] !== 'file') {
        postData[value[0]] = value[1];
      // }
    }
    // ファイルデータ
    const res = await axios.put(`${URL}/posts/comments/${ID}`, postData);
    // // フォームをリセット
    document.keijibanForm.reset();
    console.log('res = ', res);
    // const newPost = res.data;
    createCommentData(res.data);
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

