const express = require('express');
const app = express();
const axios = require('axios');
const HOST = 'localhost';
const PORT = 3003

app.use(express.json());

app.get('/fakeapi', (req, res, next) => {
  res.send("Hello from fake api server");
})

app.post('/bogusapi', (req, res, next) => {
  res.send("This is bogus api");
})

app.listen(PORT, () => { 

  const authString = 'gomathi:gomathiA/20'
  const encodeAuth = Buffer.from(authString, 'utf8').toString('base64');

  console.log("encodedAuth", encodeAuth);
  try {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/register',
      headers: { 
        'authorization': encodeAuth,
        'Content-Type' : 'application/json'},
      data: {
        apiName: "registrytest-gm-test",
        protocol: "http",
        host: HOST,
        port: PORT, 
      }
    }).then((response) => {
      console.log(response.data)
    }).catch ((err) =>{
      throw err;
    })
    console.log("Server is listening in port 3002");
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  
});