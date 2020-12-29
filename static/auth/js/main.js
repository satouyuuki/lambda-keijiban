const idToken = (() => {
  return location.hash.slice(1);
})();

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:248a47d5-22ee-4aea-bfb0-656799868456',
  Logins: {
    'cognito-idp.us-east-1.amazonaws.com/us-east-1_ded6avfBY': idToken
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
