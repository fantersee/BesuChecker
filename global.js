module.exports = async ()=>{
	global.moment = require('moment-timezone');
	global.R = require('ramda');
	global.SET = require('./setting');
};
