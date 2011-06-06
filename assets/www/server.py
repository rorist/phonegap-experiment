#!/usr/bin/python
import SimpleHTTPServer
import SocketServer


class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(404)
        self.send_header('Content-type','text/html')
        self.end_headers()
        self.wfile.write("nothing here")
        return
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
        self.wfile.write("picdata=")
        length = int(self.headers.getheader('content-length'))        
        data = self.rfile.read(length)
        # get data
        data = data.split('&')
        for i in range(len(data)):
            var = data[i].split('=')
            data[i] = {var[0]:var[1]}
        print data
        return

httpd = SocketServer.TCPServer(("", 3000), CustomHandler)
httpd.serve_forever()
