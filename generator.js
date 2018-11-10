var uuid = require('uuid/v1');

function generateUUID() {
	let value = uuid();
	return value;
}

module.exports = {};
module.exports.generateUUID = generateUUID;
