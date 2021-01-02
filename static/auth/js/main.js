const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const { CognitoUserPool, CognitoUserAttribute, CognitoUser } = require('amazon-cognito-identity-js');

const AWS = require('aws-sdk');
require('amazon-cognito-js');
import axios from 'axios';

const setToken = (token) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);  // 30分後
  document.cookie = "token=" + encodeURIComponent(token) + ";expires=" + now.toUTCString();
}
const deleteToken = () => {
  const cookies = document.cookie;
  if (!cookies) return;
  const cookiesArray = cookies.split('; ');
  const now = new Date();
  now.setYear(now.getYear() - 1);
  for (let c of cookiesArray) {
    const cArray = c.split('=');
    if (cArray[0] === 'token') {
      document.cookie = cArray[0] + '=;expires=' + now.toUTCString();
    }
  }}

const getToken = () => {
  const cookies = document.cookie;
  if (!cookies) return;
  const cookiesArray = cookies.split('; ');

  for (let c of cookiesArray) {
    const cArray = c.split('=');
    if (cArray[0] === 'token') {
      return decodeURIComponent(cArray[1]);
    }
  }
}


AWS.config.region = 'us-east-1';
const poolData = {
  UserPoolId: "us-east-1_ded6avfBY",
  ClientId: "39aeqlpkm4sfkvqeo56mgp4o0"
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const cognitoUser = userPool.getCurrentUser();
if (cognitoUser == null) location.href = `${location.protocol}//${location.host}/login.html`;
cognitoUser.getSession((err, sessresult) => { 
  if (!sessresult) location.href = `${location.protocol}//${location.host}/login.html`;
  console.log('You are now logged in.');
  if (getToken()) return;
  const token = sessresult.getIdToken().getJwtToken();
  setToken(token);
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:248a47d5-22ee-4aea-bfb0-656799868456',
    Logins: {
      'cognito-idp.us-east-1.amazonaws.com/us-east-1_ded6avfBY': token
    }
  });
});

const logoutUser = () => {
  cognitoUser.signOut();
  deleteToken();
  location.href = `${location.protocol}//${location.host}`;
}

const URL = 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test';
const posts = [];
document.addEventListener('DOMContentLoaded', iniLoad)
async function iniLoad() {
  try {
    const logout = document.getElementById('logout');
    logout.addEventListener('click', logoutUser);

    const res = await axios.get(`${URL}/api/posts`);
    this.posts = res.data;
    createTable(this.posts, dbData);
  } catch (err) {
    console.log('err', err);
  }
}
const dbData = [
  'id',
  'date',
  'name',
  'text',
  'comments',
  'imageURL',
  'password',
  'cookieFlag'
]
function createTable(posts, head) {
  const postsData = document.getElementById('postsData');
  // headを作成
  const headLen = head.length;
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headRow = document.createElement('tr');
  for (let i = 0; i < headLen; i++) {
    const th = document.createElement('th');
    th.textContent = head[i];
    headRow.appendChild(th);
  }
  const spaceTh = document.createElement('th');
  headRow.insertBefore(spaceTh, headRow.firstChild);
  thead.appendChild(headRow);
  postsData.appendChild(thead);

  posts.map((post) => {
    // const postLen = head.length;
    const tr = document.createElement('tr');
    tr.id = post.id;
    for (let i = 0; i < headLen; i++) {
      const td = document.createElement('td');
      tr.appendChild(td);
      tr.children[i].textContent = post[head[i]];
    }
    const button = document.createElement('button');
    button.textContent = '削除';
    button.addEventListener('click', {
      id: post.id,
      posts: posts,
      handleEvent: deletePost
    })
    tr.insertBefore(button, tr.firstChild);

    tbody.appendChild(tr);
  });
  postsData.appendChild(tbody);
}

const deletePost = async function (e) {
  const targetPost = this.posts.find(({ id }) => id === this.id);
  const regex = /([^\/]+)[^/]+$/g;
  const fileName = targetPost.imageURL ? targetPost.imageURL.match(regex)[0] : '';
  try {
    const token = getToken();
    const res = await axios.delete(`${URL}/admin/delete/${targetPost.id}`, {
        data: { fileName },
        headers: {
          'Authorization': token
        }
      }
    );
    const deleted = JSON.parse(res.data.body);
    this.posts.filter(({ id }) => id !== deleted.id);
    const delElm = document.getElementById(deleted.id);
    delElm.remove();
  } catch (err) {
    console.log('err', err);
  }
}