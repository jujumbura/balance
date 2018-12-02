var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
		
const ALL_FIELDS = [
  { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'parents', usage: Usage.MULTIPLE, type: Type.STRING, width: 40 },
];

const FIND_FIELDS = [
  { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING },
];

class GroupChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Groups';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
		];
		this.stateMap = {
			add: new GroupAddState(),
			edit: new GroupEditState(),
			remove: new GroupRemoveState(),
			list: new GroupListState(),
    };
	}
}

class GroupAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Groups-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}
  
  formProxy(attrMap) {
		let proxy = {
			name: attrMap.name,
			parents: attrMap.parents,
		};
    return proxy;
  }

	handleAdd(proxy) {
		this.context.project.addGroup(proxy);
		this.context.dirty = true;
	}
}

class GroupEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Groups-Edit';
		this.filterFields = FIND_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

  filterProxys(attrMap) {
		let proxy = this.context.project.findGroup(attrMap.name);
		return [ proxy ];
	}
  
  formProxy(proxy, attrMap) {
    let newProxy = Object.assign({}, proxy);
    if (attrMap.name) { newProxy.name = attrMap.name; }
    if (attrMap.parents) { newProxy.parents = attrMap.parents; }
    return newProxy;
  }

	handleModify(proxy) {
		this.context.project.updateGroup(proxy.id, proxy);
		this.context.dirty = true;
	}
}

class GroupRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Groups-Remove';
		this.filterFields = FIND_FIELDS;
    this.listFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}

  filterProxys(attrMap) {
		let proxy = this.context.project.findGroup(attrMap.name);
		return [ proxy ];
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
		this.listFields = ALL_FIELDS;
	}
	
	filterProxys() {
		let proxys = this.context.project.getAllGroups();
		return proxys;
	}
}

module.exports = {};
module.exports.GroupChooseActionState = GroupChooseActionState;
