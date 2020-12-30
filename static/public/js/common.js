'use strict';
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
  }
};
