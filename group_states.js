var io = require('./console_io');
var logger = require('./logger');
var BaseState = require('./base_state');

class GroupSelectActionState extends BaseState {
	getMessage() {
		return '[Group] Select action: ( add, list )';
	}
	
	handleInput(values) {
		switch(values[0]) {
			case 'add':
			case 'a':
				return new GroupAddState();
			case 'list':
			case 'l':
				return new GroupListState();
			default:
				return new GroupSelectActionState();
		}
	}
}

class GroupAddState extends BaseState {
	getMessage() {
		return '[Group] Add group: name';
	}
	
	handleInput(values) {
		let params = {
			name: values[0]
		}
		this.context.project.addGroup(params);
		this.context.dirty = true;

		return null;
	}
}

class GroupListState extends BaseState {
	getMessage() {
		return '[Group] List groups: ';
	}
	
	handleInput(values) {
		let groupDescs = this.context.project.getAllGroups();
		for (let i = 0; i < groupDescs.length; ++i) {
			let groupDesc = groupDescs[i];
			io.writeMessage(groupDesc.name);
		}

		return null;
	}
}

module.exports = {};
module.exports.GroupSelectActionState = GroupSelectActionState;
