// Fill in your client ID and client secret that you obtained
// while registering the application
const clientID = '953479267209-31r63sb2gbln6vm8lnoumf3bpd0jcjl4.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'https://simpletalkai.com/google_oauth_demo/oauth/redirect'

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

const oauth2Client = new google.auth.OAuth2(
    '953479267209-31r63sb2gbln6vm8lnoumf3bpd0jcjl4.apps.googleusercontent.com',
    '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',
    `${HOST}/oauth/redirect`
);

const oauth = async ctx => {
  const code = ctx.request.query.code;
  console.log(colors.green(`authorization code: ${code}`));

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


  let { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log('=========== tokens ===========', tokens);
  let {access_token, scope, token_type, expiry_date} = tokens;

  const drive = google.drive('v3');
  drive.files.list({
    auth: oauth2Client,
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err1, res1) => {
    if (err1) return console.log('The API returned an error: ' + err1);
    const files = res1.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });

  ctx.response.redirect(`${HOST}/welcome.html?access_token=${access_token}&scope=${scope}&token_type=${token_type}&expiry_date=${expiry_date}`);
};

app.use(main);
app.use(route.get('/oauth/redirect', oauth));

const proxy = new Koa();
proxy.use(mount('/node-oauth-demo', app));
proxy.listen(8881, () => {
  console.log('Server is running on http://localhost:8881/node-oauth-demo');
});
