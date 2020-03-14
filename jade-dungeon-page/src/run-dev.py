#!/usr/bin/env python2
# -*- coding: UTF-8 -*-

import sys, getopt
from SimpleHTTPServer import SimpleHTTPRequestHandler
from BaseHTTPServer import HTTPServer

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    hostname = '127.0.0.1'
    port = 8081
    allowOrigin = '*'
    argv = sys.argv[1:]
    try:
        opts, args = getopt.getopt(argv,"hn:p:a:",["hostname","port","allow"])
    except getopt.GetoptError:
        print 'error args, see: '
        print 'python run-cdn.py -n <hostname> -p <port> -a <allow-origin>'
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print 'python run-cdn.py -n <hostname> -p <port> -a <allow-origin>'
            sys.exit()
        if opt in ("-n", "--hostname"):
            hostname = arg
        if opt in ("-p", "--port"):
            port = int(arg)
        if opt in ("-a", "--allow"):
            allowOrigin = arg
    print '                   hostname: ' , hostname
    print '                       port: ' , port
    print 'Access-Control-Allow-Origin: ' , allowOrigin 
    server = HTTPServer((hostname, port), CORSRequestHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    server.serve_forever()

