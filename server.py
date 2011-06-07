#!/usr/bin/python
import SimpleHTTPServer
import SocketServer
import sqlite3
import base64
import urllib
import os, re

db_file = "img.db"

# Create db
try:
    db = sqlite3.connect(db_file)
    c = db.cursor()
    c.execute("create table img (picname text, picdesc text, piclat text, piclon text, picdata blob, _id integer primary key)")
    db.commit()
    c.close()
except sqlite3.OperationalError, err:
    print err

class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if re.search("^\/[0-9]*\.jpg$", self.path)>0:
            self.send_response(200)
            self.send_header('Content-type','image/jpeg')
            self.end_headers()
            # Get image
            match = re.match("^\/([0-9]*)\.jpg$", self.path)
            imgid = match.group(1)
            db = sqlite3.connect(db_file)
            c = db.cursor()
            c.execute("select picdata from img where _id=%s"%imgid)
            for row in c:
                picdata = urllib.unquote(row[0]).replace("data:image/jpeg;base64,", "")
                self.wfile.write(base64.b64decode(picdata))
        elif self.path == '/points.txt':
            self.send_response(200)
            self.send_header('Content-type','text/plain')
            self.end_headers()
            # Show images markers
            db = sqlite3.connect(db_file)
            c = db.cursor()
            c.execute("select * from img")
            self.wfile.write('lat\tlon\ttitle\tdescription\ticonSize\ticonOffset\ticon\n')
            for row in c:
                self.wfile.write('%s\t%s\t%s\t%s\t21,25\t-10,-25\thttp://10.27.10.22:3000/%s.jpg\n'%
                    (row[2],row[3],row[0],row[1],row[5]))

            c.close()
        else:
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
        c.execute("insert into img ('picname','picdesc','piclat','piclon','picdata') values ('%s','%s','%s','%s','%s')"%(data['picname'], data['picdesc'], data['piclat'], data['piclon'], data['picdata']))
        db.commit()
        c.close()
        
        self.wfile.write("Image Saved")
        return

httpd = SocketServer.TCPServer(("", 3000), CustomHandler)
httpd.serve_forever()

