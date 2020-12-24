const idToken = (() => {
  return location.hash.slice(1);
})();

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:0ee0b28c-4668-4078-95e8-7c36f47fcc87',
  Logins: {
    'cognito-idp.us-east-1.amazonaws.com/us-east-1_LvmclkH3H': idToken
  },
});
if (!idToken) {
  location.href = `${location.protocol}//${location.host}/login.html`;
}

const URL = 'https://lr1ufll9if.execute-api.us-east-1.amazonaws.com/test/api';
document.addEventListener('DOMContentLoaded', iniLoad)
async function iniLoad() {
  try {
    const res = await axios.get(`${URL}/posts`);
    console.log(res);
  } catch (err) {
    console.log('err', err);
  }
}


AWS.config.credentials.get(function () {
  const accessKeyId = AWS.config.credentials.accessKeyId;
  // const secretAccessKey = AWS.config.credentials.secretAccessKey;
  // const sessionToken = AWS.config.credentials.sessionToken;
  console.log(accessKeyId);
  // console.log(secretAccessKey);
  // console.log(sessionToken);
});
