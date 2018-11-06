var io = require('./console_io');
var actions = require('./actions');
var logger = require('./logger');

class ActionController {
	constructor() {}

	async run() {
		logger.trace('ActionController.run');
		let action = actions.createInitialAction();
		while (action) {
			action = action.run();
		}
	}
}

module.exports = ActionController;
