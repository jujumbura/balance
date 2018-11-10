var enableTrace = false;
var enableDebug = true;

function trace(message) {
	if (enableTrace) {
		console.log('[trace] ' + message);
	}
}

function debug(message) {
	if (enableDebug) {
		console.log('[debug] ' + message);
	}
}

module.exports = {}
module.exports.trace = trace;
module.exports.debug = debug;
