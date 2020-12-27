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
      console.log("fileData", this);
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
      res.data.map((post) => {
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
      const newPost = res.data;
      this.posts.push(newPost);
    } catch (err) {
      console.log('err', err);
    }
  },
  deletePost: async function(id) {
    try {
      const targetPost = this.posts.find(({ id }) => id === id);
      const fileName = targetPost.imageURL || '';
      const res = await axios.delete(`${KANIKEIJIBAN.COMMON.CONSTANTS.URL}/posts/${id}`, { data: { fileName } });
      this.posts = this.posts
        .filter(({ id }) => id != res.data.id)
      const delElement = document.getElementById(id);
      delElement.remove();
    } catch (err) {
      console.log('err', err);
    }
  },
  updatePost: async function (id) {
    const text = document.getElementsByName('updateText')[0].value;
    if (!text) {
      alert('入力してください');
      return;
    }
    const res = await axios.put(`${KANIKEIJIBAN.COMMON.CONSTANTS.URL}/posts/${id}`, { text });
    if (!res) return;
    this.posts.map((post) => {
      if (post.id === res.data.id) {
        post.text = res.data.text;
        const targetElm = document.getElementById(post.id);
        targetElm.outerHTML = KANIKEIJIBAN.MAIN.VIEW.postsView(post);
      }
    });
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
      <div id="${post.id}">
        <p>name: ${post.name}</p>
        <div class="textarea-div">${post.text}</div>
        <button data-id="${post.id}" onclick="KANIKEIJIBAN.MAIN.VIEW.editPost(this.dataset.id)">更新</button>
        <button data-id="${post.id}" onclick="KANIKEIJIBAN.MAIN.SERVER.deletePost(this.dataset.id)">削除</button>
        <p>作成日: ${KANIKEIJIBAN.COMMON.UTILS.japanDate(post.date)}</p>
        <a href="./detail.html${query}">${imageObject.text}</a>
      </div>
    `;
    return result;
  },
  editPost: function (id) {
    const targetElm = document.getElementById(id);
    Array.prototype.forEach.call(targetElm.children, (item) => {
      if (item.classList.contains('textarea-div')) {
        const value = item.textContent;
        item.outerHTML = `
          <div class="textarea-div-edit">
            <textarea name="updateText" required>${value}</textarea>
            <button data-id="${id}" onclick="KANIKEIJIBAN.MAIN.VIEW.editCancel(this.dataset.id)">キャンセル</button>
            <button data-id="${id}" onclick="KANIKEIJIBAN.MAIN.SERVER.updatePost(this.dataset.id)">更新</button>
          </div>
        `;
      }
    });
  },
  editCancel: function (id) {
    const targetPost = KANIKEIJIBAN.MAIN.SERVER.posts.find(({ id }) => id === id);
    const targetElm = document.getElementById(id);
    targetElm.outerHTML = this.postsView(targetPost);
  }
};

(() => {
  KANIKEIJIBAN.MAIN.SERVER.init();
})();
