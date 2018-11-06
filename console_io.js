var prompt = require('prompt');
prompt.message = '';

var logger = require('./logger');

function getValues() {
	return new Promise(resolve => {
		logger.trace('logger.getValues');
		prompt.get('input', function(err, result) {
			let values = result.input.split(/\s+/);
			logger.debug('returning values: ' + values);
			resolve(values);
		});
	});
}

function writeMessage(message) {
	console.log(message);
}

async function readValues() {
	let values = await getValues();
	return values;
}

module.exports = {}
module.exports.writeMessage = writeMessage;
module.exports.readValues = readValues;
