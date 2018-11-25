var StateCommand = require('./state_command');
var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var InputError = require('./errors').InputError;
var DataError = require('./errors').DataError;

class BaseState {
	constructor() {
		this.context = null;
	}

	writeHeader(message) {
		io.writeMessage('[' + message + ']');
	}

	writeRequest(message) {
		io.writeMessage('- ' + message);
	}

  writeChange(message) {
    io.writeMessage('* ' + message);
  }

	writeTransition(message) {
		io.writeMessage('> ' + message);
	}

  writeError(message) {
    io.writeMessage('! ' + message);
  }
}

class ChooseState extends BaseState {
	async run() {
		this.writeHeader(this.header);

		let choice = -1;
		while (true) {
			try {
				dialogHelper.printOptions('choose', this.options);
				choice = await dialogHelper.chooseOption(this.options);
				break;
			} catch (e) {
				if (e instanceof InputError) {
					this.writeError(e.message);
				} else { throw e; }
			}
		}

		let option = this.options[choice];
		this.writeTransition('entering ' + option.label);
		return new StateCommand(StateCommand.Type.NEXT, option.state);
	}
}

class AddState extends BaseState {
  async run () {
		this.writeHeader(this.header);
		
    while (true) {
      try {
        dialogHelper.printFields('add', this.fields);
        let attrMap = await dialogHelper.submitFields(this.fields);
        this.handleAdd(attrMap);
        break;
			} catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
			}
    }
    this.writeChange('added entry');

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class EditState extends BaseState {
	async run () {
		this.writeHeader(this.header);
	
    let obj = null;
    while (true) {
      try {
        this.writeRequest('find: name');
        let value = await dialogHelper.submit();
        obj = this.findObj(value);
        break;
			} catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
			}
    }

    while (true) {
      try {
		    dialogHelper.printObj('modify', this.fields, obj);
        let attrMap = await dialogHelper.submitFields(this.fields);
        this.handleModify(obj, attrMap);
        break;
      } catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
      }
    }
    this.writeChange('modified entry');

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class RemoveState extends BaseState {
	async run () {
		this.writeHeader(this.header);
		
    while (true) {
      try {
        this.writeRequest('find: name');
        let value = await dialogHelper.submit();
        let obj = this.findObj(value);
		    this.handleRemove(obj);
        break;
      } catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
      }
    }
    this.writeChange('removed entry');

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class ListState extends BaseState {
  async run() {
    this.writeHeader(this.header);
	   
		let objs = null;
		while (true) {
			try {
				let attrMap = null;
				if (this.filterFields) {
				  dialogHelper.printFields('filter', this.filterFields);
					attrMap = await dialogHelper.submitFields(this.filterFields);
				}
		  	objs = this.produceObjs(attrMap);
				break;
			} catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					io.writeError(e.message);
				} else { throw e; }
			}
		}
      
		dialogHelper.listObjs(this.listFields, objs);

		return new StateCommand(StateCommand.Type.BACK);
	}
}

module.exports = {};
module.exports.BaseState = BaseState;
module.exports.ChooseState = ChooseState;
module.exports.AddState = AddState;
module.exports.EditState = EditState;
module.exports.RemoveState = RemoveState;
module.exports.ListState = ListState;
