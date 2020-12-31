'use strict';
import COMMON from './common.js';
import axios from 'axios';
// 名前空間
var KANIKEIJIBAN = KANIKEIJIBAN || {};
KANIKEIJIBAN.MAIN = {};

KANIKEIJIBAN.MAIN.SERVER = {
  posts: [],
  postData: {},
  updateData: {},
  init: async function () {
    this.setParameters();
    this.bindEvent();
    this.getAllPosts();
  },
  setParameters: function () {
    this.keijibanForm = document.forms.keijibanForm;
    this.output = document.getElementById('output');
    this.file = document.getElementById('file');
    this.preview = document.getElementById('preview');
  },
  bindEvent: function () {
    this.keijibanForm.addEventListener('submit', this.createPost.bind(this));
    this.file.addEventListener('change', {
      propsFile: this.file,
      propsImageOutputElem: this.preview,
      propsData: this.postData,
      callback: this.previewFile,
      handleEvent: this.handleFileSelect
    });
  },
  handleFileSelect: function (e) {
    const files = this.propsFile.files;
    if (files[0].size > COMMON.CONSTANTS.IMG_SIZE_LIMIT) {
      alert('ファイルサイズは1MB以下にしてください');
      this.propsFile.value = '';
      return;
    }
    this.callback(files[0], this.propsImageOutputElem, this.propsData);
  },
  previewFile: function (file, preview, data) {
    const reader = new FileReader();
    const mySelf = KANIKEIJIBAN.MAIN.SERVER;
    reader.addEventListener('load', {
      handleEvent: mySelf.readerLoad,
      preview: preview,
      data: data
    });
    // reader.onload = reader.onload.bind(this);
    reader.readAsDataURL(file);
  },
  readerLoad: function (e) {
    const mySelf = KANIKEIJIBAN.MAIN.SERVER;
    const imageUrl = e.target.result;
    mySelf.customFileData(imageUrl, this.data);;
    mySelf.previewFileImage(imageUrl, this.preview);
  },
  customFileData: function (imageUrl, data) {
    const parts = imageUrl.split(';');
    const mime = parts[0].split(':')[1];
    const image = parts[1];
    data.mime = mime;
    data.image = image;
  },
  previewFileImage: function (imageUrl, imageOutputElm) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.id = 'imgData';
    while (imageOutputElm.firstChild) {
      imageOutputElm.removeChild(imageOutputElm.firstChild);
    }
    imageOutputElm.appendChild(img);
  },
  getAllPosts: async function () {
    try {
      const res = await axios.get(`${COMMON.CONSTANTS.URL}/posts`);
      res.data
        .sort((a, b) => a.date < b.date ? 1 : -1)
        .map((post) => {
          this.posts.push(post);
          const postDiv = KANIKEIJIBAN.MAIN.VIEW.postsView(post);
          this.output.appendChild(postDiv);
          // const targetDiv = document.getElementById(post.id).querySelector('.card__while');
          KANIKEIJIBAN.MAIN.VIEW.createEditModeBtn(post.id);
        })
    } catch (err) {
      console.log('err', err);
    }
  },
  createPost: async function (e) {
    try {
      e.preventDefault();
      const formData = new FormData(this.keijibanForm);
      for (let value of formData.entries()) {
        if (value[0] !== 'file') {
          this.postData[value[0]] = value[1];
        }
      }
      // ファイルデータ
      const res = await axios.post(`${COMMON.CONSTANTS.URL}/posts`, this.postData);
      // // フォームをリセット
      this.keijibanForm.reset();
      this.preview.innerHTML = '';
      const newPost = res.data;
      if (newPost.cookieFlag === 'on') {
        COMMON.UTILS.setCookie(newPost.password);
      }
      this.posts.splice(0, 0, newPost);
      const postDiv = KANIKEIJIBAN.MAIN.VIEW.postsView(newPost);
      this.output.insertBefore(postDiv, this.output.firstChild);
      KANIKEIJIBAN.MAIN.VIEW.createEditModeBtn(newPost.id);

    } catch (err) {
      console.log('err', err);
    }
  },
  deletePost: async function(e) {
    try {
      const password = document.getElementsByName('deletePass')[0].value;
      if (!password) {
        alert('パスワードを入力してください');
      }
      const mySelf = KANIKEIJIBAN.MAIN.SERVER;
      const fileName = COMMON.UTILS.getS3FileName(this.id, mySelf.posts);
      const res = await axios.delete(`${COMMON.CONSTANTS.URL}/posts/${this.id}`, { data: { fileName, password } });
      mySelf.posts = mySelf.posts
        .filter(({ id }) => id != res.data.id)
      const delElement = document.getElementById(this.id);
      delElement.remove();
    } catch (err) {
      alert(err.response.data.message);
    }
  },
  updatePost: async function (e) {
    const mySelf = KANIKEIJIBAN.MAIN.SERVER;
    const text = document.getElementsByName('updateText')[0].value;
    const password = document.getElementsByName('updatePass')[0].value;
    const fileName = COMMON.UTILS.getS3FileName(this.id, mySelf.posts);
    if (!text || !password) {
      alert('テキストとパスワードを入力してください');
      return;
    }
    try {
      mySelf.updateData.text = text;
      mySelf.updateData.password = password;
      mySelf.updateData.fileName = fileName;
      const res = await axios.put(`${COMMON.CONSTANTS.URL}/posts/${this.id}`, mySelf.updateData);
      mySelf.posts.map((post) => {
        if (post.id === res.data.id) {
          post.text = res.data.text;
          post.imageURL = res.data.imageURL;
          const targetElm = document.getElementById(post.id);
          const postDiv = KANIKEIJIBAN.MAIN.VIEW.postsView(post);
          targetElm.parentNode.insertBefore(postDiv, targetElm);
          targetElm.remove();
          KANIKEIJIBAN.MAIN.VIEW.createEditModeBtn(post.id);

        }
      });
    } catch (err) {
      alert(err.response.data.message);
    }
  }
};

KANIKEIJIBAN.MAIN.VIEW = {
  createEditModeBtn: (id) => {
    const targetDiv = document.getElementById(id).querySelector('.card__while');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    button1.textContent = '編集';
    button2.textContent = '削除';
    button1.addEventListener('click', { id, handleEvent: KANIKEIJIBAN.MAIN.VIEW.editView });
    button2.addEventListener('click', { id, handleEvent: KANIKEIJIBAN.MAIN.VIEW.deleteView });
    targetDiv.appendChild(button1);
    targetDiv.appendChild(button2);
  },
  postsView: function (post) {
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
    const div = document.createElement('div');
    div.id = post.id;
    div.classList.add('card');
    div.innerHTML = `
      <p>ネーム: ${post.name}</p>
      <div class="textarea-div">${post.text}</div>
      <a href="./detail.html${query}">返信する</a>
      <p class="date">作成日: ${COMMON.UTILS.japanDate(post.date)}</p>
      <p>${imageObject.text}</p>
      <div class="card__while"></div>
    `;
    return div;
    // output.appendChild(div);
  },
  deleteView: function (e) {
    const cookieValue = COMMON.UTILS.getCookie();
    const text = `
      <div class="card__while">
        <label>パスワード: </label>
        <input type="password" name="deletePass" value="${cookieValue}">
      </div>
      <div class="card__while editModeBtn"></div>
    `;
    COMMON.UTILS.inputView(this.id, text);
    const targetDiv = document.getElementById(this.id).querySelector('.editModeBtn');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    button1.textContent = 'キャンセル';
    button2.textContent = '実行';
    button1.addEventListener('click', { handleEvent: COMMON.UTILS.inputCancel });
    button2.addEventListener('click', { id: this.id, handleEvent: KANIKEIJIBAN.MAIN.SERVER.deletePost });
    targetDiv.appendChild(button1);
    targetDiv.appendChild(button2);

  },
  editView: function (e) {
    const value = document.getElementById(this.id).querySelector('.textarea-div').textContent;
    const cookieValue = COMMON.UTILS.getCookie();
    const text = `
      <textarea class="form__textarea" name="updateText" required>${value}</textarea>
      <label for="updateFile" class="file-uploader">
        ファイルを選択して下さい
        <input type="file" id="updateFile" name="updateFile">
      </label>
      <div id="updatePreview"></div>

      <div class="card__while">
        <label>パスワード: </label>
        <input type="password" name="updatePass" required value=${cookieValue}>
      </div>
      <div class="card__while editModeBtn"></div>
    `;
    COMMON.UTILS.inputView(this.id, text);
    const file = document.getElementById('updateFile');
    const preview = document.getElementById('updatePreview');
    file.addEventListener('change', {
      propsFile: file,
      propsImageOutputElem: preview,
      propsData: KANIKEIJIBAN.MAIN.SERVER.updateData,
      callback: KANIKEIJIBAN.MAIN.SERVER.previewFile,
      handleEvent: KANIKEIJIBAN.MAIN.SERVER.handleFileSelect
    });

    const targetDiv = document.getElementById(this.id).querySelector('.editModeBtn');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    button1.textContent = 'キャンセル';
    button2.textContent = '更新';
    button1.addEventListener('click', { handleEvent: COMMON.UTILS.inputCancel });
    button2.addEventListener('click', { id: this.id, handleEvent: KANIKEIJIBAN.MAIN.SERVER.updatePost });
    targetDiv.appendChild(button1);
    targetDiv.appendChild(button2);

  }
};

(() => {
  KANIKEIJIBAN.MAIN.SERVER.init();
})();
