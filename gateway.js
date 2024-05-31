const express = require('express');
const app = express();
const routes = require('./routes');
const helmet = require('helmet');
const registry = require('./routes/registry.json')
const _ = require('lodash');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(helmet()) // helemt is used for security acts as a middleware

const auth = (req, res, next) => {

  const url = req.protocol + '://' + req.hostname + 3001 + req.path
  const authString = Buffer.from(req.headers.authorization, 'base64').toString('utf8');

  const authParts = authString.split(':')
  const username = authParts[0]
  const password = authParts[1]

  console.log(username + ':' + password)
  const user = registry.auth.users[username]

  if (user) {
    if (_.isEqual(user.username, username) && _.isEqual(user.password, password)) {
      next();
    } else {
      res.send({authenticated: false, message: "Username and password doesn't match"})
    }
  } else {
    res.send({ authenticated: false, path: url, message: 'Authentication failed: user does not exists'})
  }
  
}

app.get('/ui', (req, res) => {
  res.render('index', { services: registry.services})
})
app.use(auth); // we are using the auth middleware before running the routes
app.use('/', routes);


app.listen(3001, () => {
  console.log("Gateway listening in 3001");
});