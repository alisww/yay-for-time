"use strict;"

var sqlite3 = require('better-sqlite3');
var db = new sqlite3('./time_bot.db');

function setup() {
	db.exec("CREATE TABLE users (user TEXT,timezone TEXT)");
}

function get(user) {
	user = user.replace(" ","");
	var row = db.prepare('SELECT * FROM users WHERE user=?').get([user]);
	return row;
}

function insert(user,timezone) {
	db.prepare("INSERT INTO users VALUES (?,?)").run([user,timezone]);
}

function update(user,timezone) {
	db.prepare("UPDATE users SET timezone = ? WHERE user = ?",[timezone,user]).run([user,timezone]);
}

module.exports = { get: get, setup: setup, insert: insert };
