var express = require('express');
const app = express();
const PORT = 8087;

const SERVER_NAME = "INFO";
let users = new Map();
/*
  Map<string, ServerResponse>
*/
let colors = new Map(); 
/*
  Map<string, []>
*/

app.post("/register", function(req, res) {
  let fullData = '';
  req.on("data", data=>{
    fullData += data;
  }).on("end", ()=>{
    let name = fullData.toString();
    if(users.has(name) || name === SERVER_NAME){
      res.end("ERROR");
      return;
    }
    users.set(name, null);
    colors.set(name, [Math.random() * 255, Math.random() * 255, Math.random() * 255]);
    res.end("OK");
  });
});

app.post("/postMessage", function(req, res){
  let fullData = '';
  req.on("data", data =>{
    fullData +=data;
  }).on("end", ()=>{
    const parsed = JSON.parse(fullData);
    let mes = parsed.message;
    let name = parsed.name;
    let color = colors.get(name);

    if(mes.startsWith("/color: ")){
      color = mes.substr("/color: ".length).split(',');
      if(color.length < 3) {
        res.end("ERROR");
        return;
      }
      color = color.map(item => parseInt(item));
      for(let i=0; i<3; i++){
        if(isNaN(color[i])){
          res.end("ERROR");
          return;
        }
      }
      colors.set(name, color);
    }
    else if(mes.startsWith("/nickname: ")){
      const newName = mes.substr("/nickname: ".length);
      if(users.has(newName)){
        res.end("ERROR");
        return;
      }
      let temp = users.get(name);
      users.delete(name);
      users.set(newName, temp);
      temp = colors.get(name);
      colors.delete(name);
      colors.set(newName, temp);
    }
  

    users.forEach((value, key)=>{
      if(value == null) return;
      value.end(JSON.stringify({name: name, message: mes, color: color}));
    });

    res.end("OK");
  });
});

app.post("/getMessage", function(req, res){
  let name = "";
  let fullData = '';
  req.on("data", (data)=>{
    fullData += data;
  }).on("end", ()=>{
    name = fullData.toString();
    users.set(name, res);
  })
  .on("close", ()=>{
    users.delete(name);
  });
});


app.use(express.static('static'));

app.listen(PORT, function(){
  console.log(`port is listening on http://localhost:${PORT}`);
});

// const node = require('node-static');
// const server = new node.Server('.');

// const url = require('url');
// const http = require('http');
// const PORT = 8080;
// let onlineUsers = Object.create(null);

// http.createServer(checkAllEndpoints).listen(PORT);
// console.log(`Aby zobaczyć działanie wciśnij: http://localhost:${PORT}`);

// function onSubscribeEvent(request, response) {
//   let userId = Math.random();
//   response.setHeader("Cache-Control", "no-cache, must-revalidate");
//   response.setHeader('Content-Type', 'text/plain;charset=utf-8');
//   onlineUsers[userId] = response;
//   request.on('close', function() {
//     delete onlineUsers[userId];
//   });
// }

// function pushNewMessage(postedMessage) {
//   for (let id in onlineUsers) {
//     let responseWithUsers = onlineUsers[id];
//     responseWithUsers.end(postedMessage);
//   }
//   onlineUsers = Object.create(null);
// }

// function checkAllEndpoints(request, response) {
//   let parsedUrl = url.parse(request.url, true);
//   if (parsedUrl.pathname == '/subscribe') {
//     onSubscribeEvent(request, response);
//     return;
//   }
//   if (parsedUrl.pathname == '/publish' && request.method == 'POST') {
//     request.setEncoding('utf8');
//     let postedMessage = '';
//     request.on('data', function(dataPart) {
//       postedMessage += dataPart;
//     }).on('end', function() {
//       pushNewMessage(postedMessage);
//       response.end("ok");
//     });
//     return;
//   }
//   server.serve(request, response);
// }