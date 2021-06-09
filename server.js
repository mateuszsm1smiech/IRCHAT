var express = require('express');
const app = express();
const PORT = 8080;
const SERVER_NAME = "INFO";
let users = new Map();
let colors = new Map(); 
app.post("/changeColor", function(req, res){
  req.on("data", data =>{
    parsed = JSON.parse(data);
    const color = parsed.color;
    const name = parse.name;
    colors.set(name, color);
    res.end("OK");
  })
});

app.post("/register", function(req, res) {
  req.on("data", data=>{
    let name = data.toString();
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
  req.on("data", data =>{
    const parsed = JSON.parse(data);
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
  req.on("data", (data)=>{
    name = data.toString();
    users.set(name, res);
  }).on("close", ()=>{
    users.delete(name);
  });
});

app.use(express.static('static'));

app.listen(PORT, function(){
  console.log(`port is listening on http://localhost:${PORT}`);
});