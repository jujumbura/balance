var io = require('./console_io');
var logger = require('./logger');

class BaseState {
	constructor() {
		this.context = null;
	}
}

module.exports = BaseState;
