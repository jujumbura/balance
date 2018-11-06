var io = require('./console_io');
var logger = require('./logger');

class BaseAction {
	constructor() {}

	async run() {
		console.log('running');
		let values = await io.readValues();
		console.log(values);
	}
}

class SelectModeAction extends BaseAction {
	async run() {
		logger.trace('SelectModeAction.run');
		io.writeMessage('Select mode: products');
		let values = await io.readValues();
		let nextAction = null;
		if (values.length != 1) {
			io.writeMessage('Expected 1 value');
			nextAction = new SelectModeAction();
		}
		
		switch(values[0]) {
			case 'products':
				nextAction = new ProductSelectAction();
				break;
			default:
				io.writeMessage('Unknown mode');
				nextAction = new SelectModeAction();
				break;
		}
		logger.debug('returning action: ' + nextAction);
		return nextAction;
	}
}

class ProductSelectAction extends BaseAction {
	async run() {
		io.writeMessage('[Product] Select: TODO');
		await io.readValues();
		return new ProductSelectAction();
	}
}

function createInitialAction() {
	return new SelectModeAction();
}

module.exports = {};
module.exports.createInitialAction = createInitialAction;
