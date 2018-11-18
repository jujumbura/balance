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
		dialogHelper.printFields(this.message, this.fields);
		let result = await dialogHelper.submitFields(this.fields);
		if (result.command) { return result.command; }
		if (!result.attrs) { return new StateCommand(StateCommand.Type.Continue); }
		this.handleAdd(result.attrs);

		return new StateCommand(StateCommand.Type.Back);
	}
}

class EditState extends BaseState {
	async run () {
		io.writeMessage(this.findMessage);
		let result = await dialogHelper.submit();
		if (result.command) { return result.command; }
		if (typeof(result.value) === 'undefined') { return new StateCommand(StateCommand.Type.Continue); } 
		let obj = this.findObj(result.value);

		dialogHelper.printObj(this.modifyMessage, this.fields, obj);
		result = await dialogHelper.submitFields(this.fields);
		if (result.command) { return result.command; }
		if (typeof(result.attrs) === 'undefined') { return new StateCommand(StateCommand.Type.Continue); }
		this.handleModify(obj, result.attrs);

		return new StateCommand(StateCommand.Type.Back);
	}
}

class ListState extends BaseState {
	async run() {
		let objs = this.produceObjs();
    dialogHelper.listObjs(this.message, this.fields, objs);

		return new StateCommand(StateCommand.Type.Back);
	}
}

module.exports = {};
module.exports.BaseState = BaseState;
module.exports.ChooseState = ChooseState;
module.exports.AddState = AddState;
module.exports.EditState = EditState;
module.exports.ListState = ListState;
