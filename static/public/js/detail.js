'use strict';
import COMMON from './common.js';
import axios from 'axios';
// 名前空間
var KANIKEIJIBAN = KANIKEIJIBAN || {};
KANIKEIJIBAN.DETAIL = {};

KANIKEIJIBAN.DETAIL.SERVER = {
  postData: {},
  init: async function () {
    this.setParameters();
    this.bindEvent();
    this.getPost();
  },
  setParameters: function () {
    this.output = document.getElementById('output');
    this.keijibanForm = document.forms.keijibanForm;
  },
  bindEvent: function () {
    this.keijibanForm.addEventListener('submit', this.formSubmit.bind(this));
  },
  getPost: async function () {
    try {
      const res = await axios.get(`${COMMON.CONSTANTS.URL}/posts/${COMMON.CONSTANTS.ID}`);
      this.postData = res.data;
      this.output.innerHTML = KANIKEIJIBAN.DETAIL.VIEW.postDetailView(this.postData);

      if (!Object.keys(this.postData.comments).length) return;
      Object.values(this.postData.comments)
        .sort((a, b) => {
          if (a.date < b.date) return -1;
          else 1;
        })
        .map((comment) => {
          this.output.innerHTML += KANIKEIJIBAN.DETAIL.VIEW.postCommentsView(comment);
        })
    } catch (err) {
      console.log('err', err);
    }    
  },
  // 画像記事を送信する時
  formSubmit: async function(e) {
    e.preventDefault();
    try {
      const postData = {};
      const formData = new FormData(this.keijibanForm);
      for (let value of formData.entries()) {
        postData[value[0]] = value[1];
      }
      // ファイルデータ
      const res = await axios.put(`${COMMON.CONSTANTS.URL}/posts/comments/${COMMON.CONSTANTS.ID}`, postData);
      // // フォームをリセット
      document.keijibanForm.reset();
      const newCommentKey = Object.keys(res.data.comments).filter(i => Object.keys(this.postData.comments).indexOf(i) === -1);
      this.output.innerHTML += KANIKEIJIBAN.DETAIL.VIEW.postCommentsView(res.data.comments[newCommentKey]);
      this.postData = res.data;
    } catch (err) {
      console.log('err', err);
    }
  }
};

KANIKEIJIBAN.DETAIL.VIEW = {
  postDetailView: function(post) {
    const imgContents = post.imageURL ? `<img src="${post.imageURL}" alt="画像">` : `<p>画像はありません</p>`;
    const result =  `
      <p>id: ${post.id}</p>
      <p>ネーム: ${post.name}</p>
      <div class="textarea-div">${post.text}</div>
      <p class="date">作成日: ${COMMON.UTILS.japanDate(post.date)}</p>
      ${imgContents}
    `;
    return result;
  },
  postCommentsView: function (comment) {
    const result = `
      <p>ネーム: ${comment.name}</p>
      <div class="textarea-div">${comment.comment}</div>
      <p class="date">作成日: ${COMMON.UTILS.japanDate(comment.date)}</p>
    `;
    return result;
  }
};

(() => {
  KANIKEIJIBAN.DETAIL.SERVER.init();
})();
