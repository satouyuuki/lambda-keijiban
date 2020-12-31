'use strict';
import '../style.css';
// 名前空間
var KANIKEIJIBAN = KANIKEIJIBAN || {};
KANIKEIJIBAN.COMMON = {};

KANIKEIJIBAN.COMMON.CONSTANTS = {
  URL: 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test/api',
  ID: decodeURI(window.location.search).split('=')[1],
  IMG_SIZE_LIMIT: 1024 * 1024 * 1,
};

KANIKEIJIBAN.COMMON.UTILS = {
  japanDate: (dataTime) => {
    const date = new Date(dataTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minites = date.getMinutes();
    return `${year}年${month}月${day}日${hours}時${minites}分`;
  },
  getCookie: () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(key => key.startsWith('password'))
      .split('=')[1];
    return cookieValue;
  },
  setCookie: (password) => {
    const expires = 1000 * 60 * 60 * 1; // 1 hour
    document.cookie = `password=${password}; expires=${expires};`;
  },
  inputView: (id, text) => {
    const target = document.getElementById(id);
    const inputMode = document.getElementById('inputMode');
    if (inputMode) {
      inputMode.remove();
    }
    const div = document.createElement('div');
    div.id = 'inputMode';
    div.innerHTML = text;
    target.appendChild(div);
  },
  inputCancel: () => {
    const inputMode = document.getElementById('inputMode');
    inputMode.remove();
  },
  getS3FileName: (id, posts) => {
    const targetPost = posts.find(post => post.id === id);
    const regex = /([^\/]+)[^/]+$/g;
    return targetPost.imageURL ? targetPost.imageURL.match(regex)[0] : '';
  }
};

export default KANIKEIJIBAN.COMMON;
