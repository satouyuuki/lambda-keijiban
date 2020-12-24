'use strict';
// 名前空間
var KANIKEIJIBAN = KANIKEIJIBAN || {};
KANIKEIJIBAN.DETAIL = {};

KANIKEIJIBAN.DETAIL.CONSTANT = {
  URL: 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test/api',
  ID: decodeURI(window.location.search).split('=')[1],
};

KANIKEIJIBAN.DETAIL.SERVER = {
  postData: {},
  init: async function () {
    try {
      const res = await axios.get(`${KANIKEIJIBAN.DETAIL.CONSTANT.URL}/posts/${KANIKEIJIBAN.DETAIL.CONSTANT.ID}`);
      this.postData = res.data;
      output.innerHTML = KANIKEIJIBAN.DETAIL.VIEW.postDetailView(this.postData);
      output.innerHTML += KANIKEIJIBAN.DETAIL.VIEW.postCommentsView(this.postData.comments);
    } catch (err) {
      console.log('err', err);
    }
  },
  // 画像記事を送信する時
  formSubmit: async function(e) {
    e.preventDefault();
    try {
      const postData = {};
      const formData = new FormData(keijibanForm);
      for (let value of formData.entries()) {
        postData[value[0]] = value[1];
      }
      // ファイルデータ
      const res = await axios.put(`${KANIKEIJIBAN.DETAIL.CONSTANT.URL}/posts/comments/${KANIKEIJIBAN.DETAIL.CONSTANT.ID}`, postData);
      // // フォームをリセット
      document.keijibanForm.reset();
      this.postData = res.data;
      output.innerHTML = KANIKEIJIBAN.DETAIL.VIEW.postDetailView(this.postData);
      output.innerHTML += KANIKEIJIBAN.DETAIL.VIEW.postCommentsView(this.postData.comments);
    } catch (err) {
      console.log('err', err);
    }
  }
};


KANIKEIJIBAN.DETAIL.UTILS = {
  japanDate: function (dataTime) {
    const date = new Date(dataTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDay();
    const hours = date.getHours();
    const minites = date.getMinutes();
    return `${year}年${month}月${day}日${hours}時${minites}分`;
  }
};

KANIKEIJIBAN.DETAIL.VIEW = {
  postDetailView: function(post) {
    const imgContents = post.imageURL ? `<img src="${post.imageURL}" alt="画像">` : `<p>画像はありません</p>`;
    const result =  `
      <p>id: ${post.id}</p>
      <p>name: ${post.name}</p>
      <div class="textarea-div">${post.text}</div>
      <p>作成日: ${KANIKEIJIBAN.DETAIL.UTILS.japanDate(post.date)}</p>
      ${imgContents}
    `;
    return result;
  },
  postCommentsView: function (comments) {
    if (!Object.keys(comments).length) return;
    let result = '';
    Object.keys(comments).forEach(commentID => {
      const comment = comments[commentID];
      result += `
        <p>id: ${commentID}</p>
        <p>名前: ${comment.name}</p>
        <p>コメント: ${comment.comment}</p>
        <p>作成日: ${KANIKEIJIBAN.DETAIL.UTILS.japanDate(comment.date)}</p>
      `;
    });
    return result;
  }
};

(() => {
  const keijibanForm = document.forms.keijibanForm;
  keijibanForm.addEventListener('submit', KANIKEIJIBAN.DETAIL.SERVER.formSubmit);
  KANIKEIJIBAN.DETAIL.SERVER.init();
})();
