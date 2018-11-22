var StateCommand = require('./state_command');
var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var DataError = require('./errors').DataError;

class BaseState {
	constructor() {
		this.context = null;
	}
}

class ChooseState extends BaseState {
	async run() {
		let result = await dialogHelper.choose(this.message, this.options);
		if (result.command) { return result.command; }
		if (typeof(result.choice) === 'undefined') { return new StateCommand(StateCommand.Type.Retry); }
	
		let option = this.options[result.choice];
		io.writeMessage('-Chose ' + option.label);
		let nextState = option.state;

		return new StateCommand(StateCommand.Type.Next, nextState);
	}
}

class AddState extends BaseState {
	async run () {
		dialogHelper.printFields(this.message, this.fields);
    while (true) {
      try {
        let result = await dialogHelper.submitFields(this.fields);
        if (result.command) { return result.command; }
        if (!result.attrs) { return new StateCommand(StateCommand.Type.Retry); }
        this.handleAdd(result.attrs);
        break;
      } catch (e) {
        if (e instanceof DataError) {
          io.writeMessage(e.message);
        } else {
          throw e;
        }
      }
    }

		return new StateCommand(StateCommand.Type.Back);
	}
}

class EditState extends BaseState {
	async run () {
		io.writeMessage(this.findMessage);
		let result = await dialogHelper.submit();
		if (result.command) { return result.command; }
		if (typeof(result.value) === 'undefined') { return new StateCommand(StateCommand.Type.Retry); } 
		let obj = this.findObj(result.value);
		if (!obj) {
			io.writeMessage('-Unable to find entry');
			return new StateCommand(StateCommand.Type.Retry);
		}

		dialogHelper.printObj(this.modifyMessage, this.fields, obj);
    while (true) {
      try {
        result = await dialogHelper.submitFields(this.fields);
        if (result.command) { return result.command; }
		    if (typeof(result.attrs) === 'undefined') { return new StateCommand(StateCommand.Type.Retry); }
        this.handleModify(obj, result.attrs);
        break;
      } catch (e) {
        if (e instanceof DataError) {
          io.writeMessage(e.message);
        } else {
          throw e;
        }
      }
    }

		return new StateCommand(StateCommand.Type.Back);
	}
}

class RemoveState extends BaseState {
	async run () {
		io.writeMessage(this.findMessage);
		let result = await dialogHelper.submit();
		if (result.command) { return result.command; }
		if (typeof(result.value) === 'undefined') { return new StateCommand(StateCommand.Type.Retry); } 
		let obj = this.findObj(result.value);
		if (!obj) {
			io.writeMessage('-Unable to find entry');
			return new StateCommand(StateCommand.Type.Retry);
		}

		this.handleRemove(obj);

		return new StateCommand(StateCommand.Type.Back);
	}
}

class ListState extends BaseState {
	async run() {
    let attrs = null;
    if (this.filterFields) {
		  dialogHelper.printFields(this.filterMessage, this.filterFields);
      let result = await dialogHelper.submitFields(this.filterFields);
      if (result.command) { return result.command; }
      if (typeof(result.attrs) === 'undefined') { return new StateCommand(StateCommand.Type.Retry); }
      attrs = result.attrs;
    }

    try {
		  let objs = this.produceObjs(attrs);
      dialogHelper.listObjs(this.message, this.listFields, objs);
    } catch (e) {
      if (e instanceof DataError) {
        io.writeMessage(e.message);
        return new StateCommand(StateCommand.Type.Retry);
      } else {
        throw e;
      }
    }

		return new StateCommand(StateCommand.Type.Back);
	}
}

module.exports = {};
module.exports.BaseState = BaseState;
module.exports.ChooseState = ChooseState;
module.exports.AddState = AddState;
module.exports.EditState = EditState;
module.exports.RemoveState = RemoveState;
module.exports.ListState = ListState;
