var StateCommand = require('./state_command');
var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');

class BaseState {
	constructor() {
		this.context = null;
	}
}

class ChooseState extends BaseState {
	run() {
		let result = dialogHelper.choose(this.message, this.options);
		if (result.command) { return result.command; }
		if (!result.choice) { return new StateCommand(StateCommand.Type.Continue);
		
		let nextState = this.options[result.choice].state;
		return new StateCommand(StateCommand.Type.Next, nextState);
	}
}

class AddState extends BaseState {
	run () {
		let result = dialogHelper.submit(this.message, this.fields);
		if (result.command) { return result.command; }
		if (!result.fieldValues) { return new StateCommand(StateCommand.Type.Continue);

		this.handleSubmit(result.fieldValues);
		return new StateCommand(StateCommand.Type.Continue);
	}
}

class ListState extends BaseState {
	run() {
		dialogHelper.list(this.fields);

		return new StateCommand(StateCommand.Type.Back);
	}
}

module.exports = {};
module.exports.BaseState = BaseState;
module.exports.ChooseState = ChooseState;
