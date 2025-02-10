#!/usr/bin/env python3

import os, sys, getopt
from http.server import SimpleHTTPRequestHandler
from http.server import HTTPServer as BaseHTTPServer 
#　from BaseHTTPServer import HTTPServer

class CdnRequestHandler (SimpleHTTPRequestHandler):
	def translate_path(self, path):
		path = SimpleHTTPRequestHandler.translate_path(self, path)
		print("    path: ", path);
		relPath = os.path.relpath(path, os.getcwd())
		print("relPath: ", relPath);
		fullPath = os.path.join(self.server.base_path, relPath)
		print("fullPath: ", fullPath);
		return fullPath

	def end_headers (self):
		self.send_header('Access-Control-Allow-Origin', '*')
		SimpleHTTPRequestHandler.end_headers(self)

class CdnHttpServer(BaseHTTPServer):
	def __init__(self, basePath, address, reqHandlerClass):
		self.base_path = basePath
		BaseHTTPServer.__init__(self, address, reqHandlerClass)

if __name__ == '__main__':
	dir = './'
	hostname = '127.0.0.1'
	port = 8081
	allowOrigin = '*'
	argv = sys.argv[1:]
	try:
		opts, args = getopt.getopt(argv,"hn:d:p:a:",["hostname","port","allow"])
	except getopt.GetoptError:
		print('error args, see: ')
		print('python run-cdn.py -d <dir> -n <hostname> -p <port> -a <allow-origin>')
		sys.exit(2)
	for opt, arg in opts:
		if opt == '-h':
			print('python run-cdn.py -d <dir> -n <hostname> -p <port> -a <allow-origin>')
			sys.exit()
		if opt in ("-d", "--dir"):
			dir = arg
		if opt in ("-n", "--hostname"):
			hostname = arg
		if opt in ("-p", "--port"):
			port = int(arg)
		if opt in ("-a", "--allow"):
			allowOrigin = arg
	print('				        dir: ' , dir)
	print('				   hostname: ' , hostname)
	print('					   port: ' , port)
	print('Access-Control-Allow-Origin: ' , allowOrigin )
	server = CdnHttpServer(dir, (hostname, port), CdnRequestHandler)
	print('Starting server, use <Ctrl-C> to stop')
	server.serve_forever()

