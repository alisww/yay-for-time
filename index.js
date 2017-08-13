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
//	console.log('timezone: ',timezone);
	let time = moment().tz(timezone);
	if (time != undefined || time != null) {
		return time.format('HH:mm');
	} else {
		return undefined;
	}
}

function check_timezone_syntax(timezone) {
	if (timezone == null || timezone == undefined) {
		return false;
	} 

	if (timezone.match(timezone_regex) == null) {
		return false;
	}

	if (moment().tz(timezone) == undefined) {
		return false;
	}

	return true;
}

var client = new irc.Client(server, 'yay-for-time', {
	channels: channels,
});

function match_command(message,target,from) {
	let message_split = message.split(" ");
//	console.log(message_split);
	if (message_split[0] != undefined && (message_split[1] != undefined || message_split[0] == "!usage")) {
		switch (message_split[0]) {
			case "!time":
				if (check_timezone_syntax(message_split[1])) {
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
				if (check_timezone_syntax(message_split[1])) {
					db.insert(from,message_split[1]);
				} else {
					client.say(target,`Invalid timezone syntax ): The message should be like !register US/Central`);
				}
				break;
			case "!update":
				if (check_timezone_syntax(message_split[1])) {
					db.update(from,message_split[1]);
				} else {
					client.say(target,`Invalid timezone syntax ): The message should be like !register US/Central`);
				}
				break;
			case "!usage":
				client.say(target,`yay-for-time, by Alis (github.com/alisww) \n Usage: !register <timezone> | !time u/<user> | !time <timezone> | !update <timezone> \n Tools to guess your timezone: https://alisww.github.io/index.html`);
				break;
			default:
				break;
		}
	}
}

client.addListener('message',function(from,to,message) {
	let to_ = to;
	if (to == "yay-for-time") {
		to_ = from;
	}

	match_command(message,to_,from);
});

client.addListener('error', function(message) {
	console.log("error: ",message);
});


