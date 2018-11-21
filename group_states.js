var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;

const FIELDS = [
  { label: 'name', usage: Usage.REQUIRED },
  { label: 'parents', usage: Usage.MULTIPLE },
];

class GroupChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.message = '[Groups] Choose';
		this.options = [
			{ label: 'add', state: new GroupAddState() },
			{ label: 'edit', state: new GroupEditState() },
			{ label: 'list', state: new GroupListState() },
		];
	}
}

class GroupAddState extends baseStates.AddState {
	constructor() {
		super();
		this.message = '[Groups-Add] Enter';
		this.fields = FIELDS;
	}

	handleAdd(attrs) {
		let params = {
			name: attrs[0],
			parents: attrs[1],
		};
		this.context.project.addGroup(params);
		this.context.dirty = true;
	}
}

class GroupEditState extends baseStates.EditState {
	constructor() {
		super();
		this.findMessage = '[Groups-Edit] Find';
		this.modifyMessage = '[Groups-Edit] Modify';
		this.fields = FIELDS;
	}

	findObj(value) {
		let desc = this.context.project.findGroup(value);
		return desc;
	}

	handleModify(obj, attrs) {
		let params = {
			name: attrs[0],
			parents: attrs[1],
		};
		this.context.project.updateGroup(obj.id, params);
		this.context.dirty = true;
	}
}

class GroupListState extends baseStates.ListState {
	constructor() {
		super();
		this.message = '[Groups-List] ';
		this.fields = FIELDS;
	}
	
	produceObjs() {
		let productDescs = this.context.project.getAllGroups();
		return productDescs;
	}
}

module.exports = {};
module.exports.GroupChooseActionState = GroupChooseActionState;