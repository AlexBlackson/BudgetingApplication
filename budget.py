"""
Written by Alex Blackson
For CS1520 with Todd Waits
Last Editted: 12/6/2017
"""

import json
from flask import Flask, render_template, request, jsonify
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

CATEGORIES = []

PURCHASES = []

cParser = reqparse.RequestParser()
cParser.add_argument("name")
cParser.add_argument("budget", type=int)

pParser = reqparse.RequestParser()
pParser.add_argument("category")
pParser.add_argument("amount", type=int)
pParser.add_argument("reason")
pParser.add_argument("date")

def abort_cat_doesnt_exist(name):
	abort(404, message="Category {} doesn't exist".format(name))

def abort_if_cat_doesnt_exist(name):
	for c in CATEGORIES:
		if c["name"] == name:
			return
	abort(404, message="Category {} doesn't exist".format(name))

@app.route("/")
def root_page():
	cats = []
	for c in CATEGORIES:
		cats.append(c["name"])
	return render_template("rootpage.html", categories=cats)

class Category(Resource):
	def delete(self, name):
		abort_if_cat_doesnt_exist(name)
		i = 0
		for c in CATEGORIES:
			if c["name"] == name:
				del CATEGORIES[i]
			i = i + 1
		j = 0 
		for p in PURCHASES:
			if p["category"] == name:
				PURCHASES[j]["category"] = ""
			j = j + 1
		return "", 204

	def get(self, name):
		for c in CATEGORIES:
			if c["name"] == name:
				return c
		abort_cat_doesnt_exist(name)
		return None

class Categories(Resource):
	def get(self):
		return [CATEGORIES, PURCHASES]

	def post(self):
		args = cParser.parse_args()
		args["remaining"] = args["budget"]
		CATEGORIES.append(args)
		return CATEGORIES[len(CATEGORIES)-1], 201

class Purchases(Resource):

	def get(self):
		return PURCHASES

	def post(self):
		args = pParser.parse_args()
		if args["category"] == "Unspecified":
			args["category"] = ""
		PURCHASES.append(args)
		return PURCHASES[len(PURCHASES)-1], 201

api.add_resource(Categories, '/cats')
api.add_resource(Category, '/cats/<name>')
api.add_resource(Purchases, '/purchases')

if __name__ == '__main__':
	app.run(debug=True)