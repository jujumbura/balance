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
	async run() {
		let result = await dialogHelper.choose(this.message, this.options);
		if (result.command) { return result.command; }
		if (typeof(result.choice) === 'undefined') { return new StateCommand(StateCommand.Type.Continue); }
	
		let option = this.options[result.choice];
		io.writeMessage('-Chose ' + option.label);
		let nextState = option.state;
		return new StateCommand(StateCommand.Type.Next, nextState);
	}
}

class AddState extends BaseState {
	async run () {
		let result = await dialogHelper.submit(this.message, this.fields);
		if (result.command) { return result.command; }
		if (!result.fieldValues) { return new StateCommand(StateCommand.Type.Continue); }

		this.handleSubmit(result.fieldValues);
		return new StateCommand(StateCommand.Type.Continue);
	}
}

class ListState extends BaseState {
	async run() {
		let descs = this.produceDescs();
		dialogHelper.list(this.message, this.fields, descs);

		return new StateCommand(StateCommand.Type.Back);
	}
}

module.exports = {};
module.exports.BaseState = BaseState;
module.exports.ChooseState = ChooseState;
module.exports.AddState = AddState;
module.exports.ListState = ListState;
