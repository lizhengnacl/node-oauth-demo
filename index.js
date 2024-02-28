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
const colors = require('./util/colors');

const app = new Koa();
const main = serve(path.join(__dirname + '/public'));

const HOST = 'https://simpletalkai.com/node-oauth-demo'

const oauth = async ctx => {
  const requestToken = ctx.request.query.code;
  // console.log('=========== ctx.request ===========', ctx.request);
  // console.log('=========== ctx.request.query ===========', ctx.request.query);
  console.log(colors.green(`authorization code: ${requestToken}`));

  // console.log('=========== tokens ===========', tokens);
  // console.log(colors.green(`access token: ${tokens}`));
  // oauth2Client.setCredentials(tokens);

  const tokenResponse = await axios({
    method: 'post',
    url: 'https://oauth2.googleapis.com/token?' +
        `client_id=${clientID}&` +
        `client_secret=${clientSecret}&` +
        `code=${requestToken}` +
        `redirect_uri=${redirectUri}` +
        `grant_type=authorization_code`,
    headers: {
      accept: 'application/json',
    },
  });

  const accessToken = tokenResponse.data.access_token;
  console.log(colors.green(`access token: ${accessToken}`));


  const result = await axios({
    method: 'get',
    url: `https://www.googleapis.com/oauth2/v1/userinfo`,
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
  ctx.response.redirect(`${HOST}/welcome.html?name=${name}&id=${id}`);
};

app.use(main);
app.use(route.get('/oauth/redirect', oauth));

app.listen(8881);
console.log(colors.green('=========== 8881 ==========='));
