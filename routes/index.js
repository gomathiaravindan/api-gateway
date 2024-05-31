const express = require('express');
const router = express.Router();
const axios = require('axios');
const registry = require("./registry.json");
const fs = require('fs');
const loadbalancer = require('../util/loadbalancer');


router.post('/enable/:apiName', (req, res) => {
  const apiName = req.params.apiName
  const requestBody = req.body
  const instances = registry.services[apiName].instances
  const index = instances.findIndex((services) => { return services.url === requestBody.url})
  if (index == -1) {
    res.send({ status: "error", message: "Could not find " + requestBody.url + "for service " + apiName})
  } else {
    instances[index].enabled = requestBody.enabled

    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
      if (err) {
        res.send("Could not enable/disable" + requestBody.url + "for service "+ apiName + err);
      } else {
        res.send("Successfully registered!!" + loadBalanceStrategy);
      }
    });  

  }
})
router.all('/:apiName/:path', (req, res) => {
 
const service = registry.services[req.params.apiName]
if (service) {
  if (!service.loadBalanceStrategy) {
    service.loadBalanceStrategy = 'ROUND_ROBIN'

    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
      if (err) {
        res.send("Could not register "+ loadBalanceStrategy + "'\n" + err);
      } else {
        res.send("Successfully registered!!" + loadBalanceStrategy);
      }
    });  
  }
    const newIndex = loadbalancer[service.loadBalanceStrategy](service);
    const url = service.instances[newIndex].url

    axios({
      method: req.method,
      url: url + req.params.path,
      headers: req.headers,
      data: req.body
    }).then((response) => {
      res.send(response.data);
    });
  } else {
    res.send("Url not found");
  }
})

router.post('/register', (req, res) => {
  const registrationInfo = req.body
  registrationInfo.url = registrationInfo.protocol + "://" + registrationInfo.host + ":" + registrationInfo.port + "/";

  if (apiAlreadyExists(registrationInfo)) {
    return res.send("Service already registered");
  }
    registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo });

    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
      if (err) {
        res.send("Could not register "+ registrationInfo.apiName + "'\n" + err);
      } else {
        res.send("Successfully registered!!" + registrationInfo.apiName);
      }
    });  
  })


router.post('/unregister', (req, res) => {
  const registrationInfo = req.body;

  if (apiAlreadyExists(registrationInfo)) {
    const index = registry.services[registrationInfo.apiName].instances.findIndex((instance) => {
      return registrationInfo.url === instance.url 
    });

    registry.services[registrationInfo.apiName].instances.splice(index, 1)

    // removed the registry and writting the updated record again into the file
    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
      if (err) {
        res.send("Could not register "+ registrationInfo.apiName + "'\n" + err);
      } else {
        res.send("Successfully unregistered!!" + registrationInfo.apiName);
      }
    });  

  } else {
    res.send("Couldn't find the registry");
  }
})

const apiAlreadyExists = (registrationInfo) => {
  let exists = false;
  registry.services[registrationInfo.apiName].instances.forEach(instance => {
    if (instance.url === registrationInfo.url) {
      exists = true;
      return;
    }
  })
  return exists;
}
module.exports = router;