"use strict";

var moment = require('moment-timezone');
var irc = require('irc');
var db = require('./db.js');

const channels = [];
const server = "";

const help_regex = /!usage/g;
const timezone_regex = /[A-Z]+(?:\w|_)+\/(?:\w|_)+/g;
const user_regex = /(?:u\/)(\w+|\d+)/

function get_hour(timezone) {
	console.log('timezone: ',timezone);
	let time = moment().tz(timezone);
	if (time != undefined || time != null) {
		return time.format('HH:mm');
	} else {
		return undefined;
	}
}

var client = new irc.Client(server, 'yay-for-time', {
	channels: channels,
});

function match_command(message,target,from) {
	let message_split = message.split(" ");
	console.log(message_split);
	switch (message_split[0]) {
		case "!time":
			if (message_split[1].match(timezone_regex) !== null) {
				let timezone = message_split[1];
				let hour = get_hour(timezone);
				client.say(target,`It's ${hour} at ${timezone}`);
			} else {
				let user = message_split[1].replace("u/","");
				let row = db.get(user);
				if (row !== undefined) {
					let timezone = row.timezone;
					let hour = get_hour(timezone);
					if (hour != undefined) {
						client.say(target,`It's ${hour} at ${user}'s timezone, ${timezone}`);
					}
				}
			}
			break;
		case "!register":
			db.insert(from,message_split[1]);
			break;
		case "!update":
			db.update(from,message_split[1]);
			break;
		case "!usage":
			client.say(target,`yay-for-time, by Alis (github.com/alisww) \n Usage: !register <timezone> | !time u/<user> | !time <timezone> | !update <timezone>`);
			break;
		default:
			break;
	}
}

client.addListener('message',function(from,to,message) {
	if (to == "yay-for-time") {
		from = to;
	}

	match_command(message,to,from);
});

client.addListener('error', function(message) {
	console.log("error: ",message);
});
