// Fill in your client ID and client secret that you obtained
// while registering the application
const clientID = '240beeadb32b08f2fcb5';
const clientSecret = '9a9109e86e054ba1698c9bf9fd61db89a0dd9e33';

const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const route = require('koa-route');
const axios = require('axios');
const colors = require('./util/colors');

const app = new Koa();

const main = serve(path.join(__dirname + '/public'));

const oauth = async ctx => {
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
  ctx.response.redirect(`/welcome.html?name=${name}&id=${id}`);
};

app.use(main);
app.use(route.get('/oauth/redirect', oauth));

app.listen(8080);
console.log('=========== 8080 ===========');
