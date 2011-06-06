#!/usr/bin/python
import SimpleHTTPServer
import SocketServer
import sqlite3
import os

db_file = "img.db"

# Create db
try:
    db = sqlite3.connect(db_file)
    c = db.cursor()
    c.execute("create table img (picname text, picdesc text, picauthor text, picdata blob)")
    db.commit()
    c.close()
except sqlite3.OperationalError, err:
    print err

class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(404)
        self.send_header('Content-type','text/plain')
        self.end_headers()
        self.wfile.write("nothing here")
        return
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
        length = int(self.headers.getheader('content-length'))        
        post = self.rfile.read(length)
        # get data
        post = post.split('&')
        data = {}
        for i in range(len(post)):
            entry = post[i].split('=')
            data[entry[0]] = entry[1]

        # Write data to DB 
        db = sqlite3.connect(db_file)
        c = db.cursor()
        c.execute("insert into img values ('%s','%s','%s','%s')"%(data['picname'], data['picdesc'], data['picauthor'], data['picdata']))
        db.commit()
        c.close()
        
        self.wfile.write("request OK")
        return

httpd = SocketServer.TCPServer(("", 3000), CustomHandler)
httpd.serve_forever()

