const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const { CognitoUserPool, CognitoUserAttribute, CognitoUser }  = require('amazon-cognito-identity-js');

const AWS = require('aws-sdk');
require('amazon-cognito-js');

const poolData = {
  UserPoolId: "us-east-1_ded6avfBY",
  ClientId: "39aeqlpkm4sfkvqeo56mgp4o0"
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const loginForm = document.loginForm;
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const authenticationData = {};
  for (let value of formData.entries()) {
    authenticationData[value[0]] = value[1];
  }
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  
  const userData = {
    Username: authenticationData.Username,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
  
      //POTENTIAL: Region needs to be set if not already set previously elsewhere.
      AWS.config.region = 'us-east-1';
  
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:248a47d5-22ee-4aea-bfb0-656799868456',
        Logins: {
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_ded6avfBY': idToken
        },
      });
  
      //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
      AWS.config.credentials.refresh(error => {
        if (error) {
          console.error(error);
        } else {
          // Instantiate aws sdk service objects now that the credentials have been updated.
          // example: var s3 = new AWS.S3();
          console.log('Successfully logged!');
          location.href = `${location.protocol}//${location.host}#${idToken}`;
        }
      });
    },
  
    onFailure: function (err) {
      alert(err.message || JSON.stringify(err));
    },
  });
})