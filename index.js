// Fill in your client ID and client secret that you obtained
// while registering the application


const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const route = require('koa-route');
const axios = require('axios');
const mount = require('koa-mount');
const { google } = require('googleapis');
const colors = require('./util/colors');


const app = new Koa();
const main = serve(path.join(__dirname + '/public'));

const HOST = 'https://simpletalkai.com/node-oauth-demo'

const oauth = async ctx => {
  const clientID = '240beeadb32b08f2fcb5';
  const clientSecret = '9a9109e86e054ba1698c9bf9fd61db89a0dd9e33';


  const requestToken = ctx.request.query.code;
  console.log(colors.red(`authorization code: ${requestToken}`));

  const tokenResponse = await axios({
    method: 'post',
    url: 'https://github.com/login/oauth/access_token?' +
        `client_id=${clientID}&` +
        `client_secret=${clientSecret}&` +
        `code=${requestToken}`,
    headers: {
      accept: 'application/json',
    },
  });

  const accessToken = tokenResponse.data.access_token;
  console.log(colors.red(`access token: ${accessToken}`));

  const result = await axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      accept: 'application/json',
      Authorization: `token ${accessToken}`,
    },
  });
  console.log(result.data);
  const name = result.data.name;
  const id = result.data.id;

  ctx.cookies.set('token', accessToken, {
    httpOnly: true,
  });
  ctx.response.redirect(`${HOST}/welcome.html?from=github&name=${name}&id=${id}`);
};

const oauthGoogle = async ctx => {
  const clientId = '953479267209-31r63sb2gbln6vm8lnoumf3bpd0jcjl4.apps.googleusercontent.com'
  const clientSecret = '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';
  const HOST = 'https://simpletalkai.com/node-oauth-demo'
  const redirectUri = `${HOST}/oauth/redirect-google`

  const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
  );

  const code = ctx.request.query.code;
  console.log(colors.green(`authorization code: ${code}`));

  // '=========== 使用API ==========='
  // const tokenResponse = await axios({
  //   method: 'post',
  //   url: 'https://oauth2.googleapis.com/token?' +
  //       `client_id=${clientID}&` +
  //       `client_secret=${clientSecret}&` +
  //       `code=${requestToken}` +
  //       `redirect_uri=${redirectUri}` +
  //       `grant_type=authorization_code`,
  //   headers: {
  //     accept: 'application/json',
  //   },
  // });
  //
  // const accessToken = tokenResponse.data.access_token;
  // console.log(colors.green(`access token: ${accessToken}`));
  //
  //
  // const result = await axios({
  //   method: 'get',
  //   url: `https://www.googleapis.com/oauth2/v1/userinfo`,
  //   headers: {
  //     accept: 'application/json',
  //     Authorization: `token ${accessToken}`,
  //   },
  // });
  // console.log(result.data);
  // const name = result.data.name;
  // const id = result.data.id;
  //
  // ctx.cookies.set('token', accessToken, {
  //   httpOnly: true,
  // });
  // ctx.response.redirect(`${HOST}/welcome.html?name=${name}&id=${id}`);

  // '=========== 使用SDK ==========='
  // code to token
  let { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  let {access_token, scope, token_type, expiry_date} = tokens;

  // 使用token，以Google云盘为例，其它参考文档
  // const drive = google.drive('v3');
  // drive.files.list({
  //   auth: oauth2Client,
  //   pageSize: 10,
  //   fields: 'nextPageToken, files(id, name)',
  // }, (err1, res1) => {
  //   if (err1) return console.log('The API returned an error: ' + err1);
  //   const files = res1.data.files;
  //   if (files.length) {
  //     console.log('Files:');
  //     files.map((file) => {
  //       console.log(`${file.name} (${file.id})`);
  //     });
  //   } else {
  //     console.log('No files found.');
  //   }
  // });

  if (oauth2Client.isSignedIn.get()) {
    var profile = oauth2Client.currentUser.get().getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
  }

  ctx.response.redirect(`${HOST}/welcome.html?from=google&access_token=${access_token}&scope=${scope}&token_type=${token_type}&expiry_date=${expiry_date}`);
};

app.use(main);
app.use(route.get('/oauth/redirect', oauth));
app.use(route.get('/oauth/redirect-google', oauthGoogle));

const proxy = new Koa();
proxy.use(mount('/node-oauth-demo', app));
proxy.listen(8881, () => {
  console.log('Server is running on http://localhost:8881/node-oauth-demo');
});
