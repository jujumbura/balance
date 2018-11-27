var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

class GroupChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Groups';
		this.options = [
			{ label: 'add',     state: new GroupAddState() },
			{ label: 'edit',    state: new GroupEditState() },
			{ label: 'remove',  state: new GroupRemoveState() },
			{ label: 'list',    state: new GroupListState() },
		];
	}
}

class GroupAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Groups-Add';
		this.fields = [
      { label: 'name',    usage: Usage.REQUIRED },
      { label: 'parents', usage: Usage.MULTIPLE },
    ];
	}

	handleAdd(attrMap) {
		let proxy = {
			name: attrMap['name'],
			parents: attrMap['parents'],
		};
		this.context.project.addGroup(proxy);
		this.context.dirty = true;
	}
}

class GroupEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Groups-Edit';
		this.fields = [
      { label: 'name',    usage: Usage.REQUIRED },
      { label: 'parents', usage: Usage.MULTIPLE },
    ];
	}

	findProxy(value) {
		let desc = this.context.project.findGroup(value);
		return desc;
	}

	handleModify(proxy, attrMap) {
		let proxy = {
			name: attrMap['name'],
			parents: attrMap['parents'],
		};
		this.context.project.updateGroup(proxy.id, proxy);
		this.context.dirty = true;
	}
}

class GroupRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Groups-Remove';
	}

	findProxy(value) {
		let desc = this.context.project.findGroup(value);
		return desc;
	}

	handleRemove(proxy) {
		this.context.project.removeGroup(proxy.id);
		this.context.dirty = true;
	}
}

class GroupListState extends baseStates.ListState {
	constructor() {
		super();
		this.header = 'Groups-List';
		this.listFields = [
      { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
      { label: 'parents', usage: Usage.MULTIPLE, type: Type.STRING, width: 40 },
    ];
	}
	
	produceProxys() {
		let proxys = this.context.project.getAllGroups();
		return proxys;
	}
}

module.exports = {};
module.exports.GroupChooseActionState = GroupChooseActionState;
