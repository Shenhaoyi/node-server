import {IncomingMessage, ServerResponse} from 'http';
import * as http from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');

server.on('request', (request: IncomingMessage, response: ServerResponse) => {  //请求事件
  const {url: path, method, headers} = request;
  if(method !== 'GET'){
    response.setHeader('Content-Type', 'text/html; charset=utf-8'); //暂时为处理响应头的设置
    response.statusCode=405
    response.end('不支持该请求')
    return
  }

  const {pathname, search} = url.parse(path);
  // console.log(pathname)
  let filename = pathname.substring(1) // 首页路径是/
  if(filename.length === 0){
    filename = 'index.html'
  }
  // response.setHeader('Content-Type', 'text/html; charset=utf-8'); //暂时为处理响应头的设置
  fs.readFile(p.resolve(publicDir, filename), (error, data) => {
    if (error) {
      console.log(error);
      if (error.errno === -4058) {
        response.statusCode = 404;
        fs.readFile(p.resolve(publicDir, '404.html'), (error, data)=>{
          response.end(data);
        })
      }else if(error.errno === -4068) {
        response.setHeader('Content-Type', 'text/html; charset=utf-8'); //暂时为处理响应头的设置
        response.statusCode = 403;
        response.end('无权查看目录内容');
      }else{
        response.statusCode = 500;
        response.end('服务器内部繁忙，请稍后再试')
      }
    } else {
      //返回文件内容
      //添加缓存 Cache-Control:public, max-age=31536000
      response.setHeader('Cache-Control','public,max-age=31536000')
      response.end(data);
    }
  });
});

server.listen(8888);  //启动 HTTP服务器监听连接