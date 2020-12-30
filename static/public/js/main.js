'use strict';
// 名前空間
var KANIKEIJIBAN = KANIKEIJIBAN || {};
KANIKEIJIBAN.MAIN = {};

KANIKEIJIBAN.MAIN.SERVER = {
  posts: [],
  postData: {},
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
    this.file.addEventListener('change', this.handleFileSelect.bind(this));
  },
  handleFileSelect: function () {
    const files = this.file.files;
    if (files[0].size > KANIKEIJIBAN.COMMON.CONSTANTS.IMG_SIZE_LIMIT) {
      alert('ファイルサイズは1MB以下にしてください');
      this.file.value = '';
      return;
    }
    this.previewFile(files[0]);
  },
  previewFile: function (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageUrl = e.target.result;
      const fileData = this.customFileData(imageUrl);
      Object.assign(this.postData, fileData);
      const img = document.createElement("img");
      img.src = imageUrl;
      img.id = 'imgData';
      while (this.preview.firstChild) {
        this.preview.removeChild(this.preview.firstChild);
      }
      this.preview.appendChild(img);
    }
    // thisをバインド
    reader.onload = reader.onload.bind(this);
    reader.readAsDataURL(file);
  },
  customFileData: function (imageUrl) {
    const parts = imageUrl.split(';');
    const mime = parts[0].split(':')[1];
    const image = parts[1];
    return { mime, image };
  },
  getAllPosts: async function () {
    try {
      const res = await axios.get(`${KANIKEIJIBAN.COMMON.CONSTANTS.URL}/posts`);
      res.data
        .sort((a, b) => a.date < b.date ? 1 : -1)
        .map((post) => {
          this.posts.push(post);
          this.output.innerHTML += KANIKEIJIBAN.MAIN.VIEW.postsView(post);
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
      const res = await axios.post(`${KANIKEIJIBAN.COMMON.CONSTANTS.URL}/posts`, this.postData);
      // // フォームをリセット
      this.keijibanForm.reset();
      this.preview.innerHTML = '';
      const newPost = res.data;
      if (newPost.cookieFlag === 'on') {
        KANIKEIJIBAN.COMMON.UTILS.setCookie(newPost.password);
      }
      this.posts.splice(0, 0, newPost);
      this.output.innerHTML = KANIKEIJIBAN.MAIN.VIEW.postsView(newPost) + this.output.innerHTML;
    } catch (err) {
      console.log('err', err);
    }
  },
  deletePost: async function(id) {
    try {
      const password = document.getElementsByName('deletePass')[0].value;
      if (!password) {
        alert('パスワードを入力してください');
      }
      const targetPost = this.posts.find(post => post.id === id);
      const regex = /([^\/]+)[^/]+$/g;
      const fileName = targetPost.imageURL ? targetPost.imageURL.match(regex)[0] : '';
      const res = await axios.delete(`${KANIKEIJIBAN.COMMON.CONSTANTS.URL}/posts/${id}`, { data: { fileName, password } });
      this.posts = this.posts
        .filter(({ id }) => id != res.data.id)
      const delElement = document.getElementById(id);
      delElement.remove();
    } catch (err) {
      alert(err.response.data.message);
    }
  },
  updatePost: async function (id) {
    const text = document.getElementsByName('updateText')[0].value;
    const password = document.getElementsByName('updatePass')[0].value;
    if (!text || !password) {
      alert('テキストとパスワードを入力してください');
      return;
    }
    try {
      const res = await axios.put(`${KANIKEIJIBAN.COMMON.CONSTANTS.URL}/posts/${id}`, { text, password });
      this.posts.map((post) => {
        if (post.id === res.data.id) {
          post.text = res.data.text;
          const targetElm = document.getElementById(post.id);
          targetElm.outerHTML = KANIKEIJIBAN.MAIN.VIEW.postsView(post);
        }
      });
    } catch (err) {
      alert(err.response.data.message);
    }
  }
};

KANIKEIJIBAN.MAIN.VIEW = {
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
    const result = `
      <div id="${post.id}" class="card">
        <p>ネーム: ${post.name}</p>
        <div class="textarea-div">${post.text}</div>
        <a href="./detail.html${query}">返信する</a>
        <p class="date">作成日: ${KANIKEIJIBAN.COMMON.UTILS.japanDate(post.date)}</p>
        <p>${imageObject.text}</p>
        <div class="card__while">
          <button data-id="${post.id}" onclick="KANIKEIJIBAN.MAIN.VIEW.editView(this.dataset.id)">編集</button>
          <button data-id="${post.id}" onclick="KANIKEIJIBAN.MAIN.VIEW.deleteView(this.dataset.id)">削除</button>
        </div>
      </div>
    `;
    return result;
  },
  deleteView: function (id) {
    const cookieValue = KANIKEIJIBAN.COMMON.UTILS.getCookie();
    const text = `
      <div class="card__while">
        <label>パスワード: </label>
        <input type="password" name="deletePass" value="${cookieValue}">
      </div>
      <div class="card__while">
        <button onclick="KANIKEIJIBAN.COMMON.UTILS.inputCancel()">キャンセル</button>
        <button data-id="${id}" onclick="KANIKEIJIBAN.MAIN.SERVER.deletePost(this.dataset.id)">実行</button>
      </div>
    `;
    KANIKEIJIBAN.COMMON.UTILS.inputView(id, text);
  },
  editView: function (id) {
    const value = document.getElementById(id).querySelector('.textarea-div').textContent;
    const cookieValue = KANIKEIJIBAN.COMMON.UTILS.getCookie();
    const text = `
      <textarea class="form__textarea" name="updateText" required>${value}</textarea>
      <div class="card__while">
        <label>パスワード: </label>
        <input type="password" name="updatePass" required value=${cookieValue}>
      </div>
      <div class="card__while">
        <button onclick="KANIKEIJIBAN.COMMON.UTILS.inputCancel()">キャンセル</button>
        <button data-id="${id}" onclick="KANIKEIJIBAN.MAIN.SERVER.updatePost(this.dataset.id)">更新</button>
      </div>
    `;
    KANIKEIJIBAN.COMMON.UTILS.inputView(id, text);
  }
};

(() => {
  KANIKEIJIBAN.MAIN.SERVER.init();
})();
