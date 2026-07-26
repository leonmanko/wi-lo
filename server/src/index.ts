const http = require("http"); 
 
const server = http.createServer((req, res) =
  res.writeHead(200, { "Content-Type": "application/json" }); 
  res.end(JSON.stringify({ status: "ok", name: "WI-LO API" })); 
}); 
 
const PORT = process.env.PORT || 3000; 
server.listen(PORT, () =
  console.log(`WI-LO API running on port ${PORT}`); 
}); 
