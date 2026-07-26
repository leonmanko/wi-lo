import http from "http"; 
 
const server = http.createServer((_req, res) =
  res.writeHead(200, { "Content-Type": "application/json" }); 
  res.end(JSON.stringify({ status: "ok", name: "WI-LO API" })); 
}); 
 
server.listen(PORT, () =
  console.log(`WI-LO API running on port ${PORT}`); 
}); 
 
export default server; 
