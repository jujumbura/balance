var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
		
const ALL_FIELDS = [
  { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
];

const FIND_FIELDS = [
  { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING },
];

const FILTER_FIELDS = [
  { label: 'name',    usage: Usage.OPTIONAL, type: Type.STRING },
];

class VendorChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Vendors';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
		];
		this.stateMap = {
			add: new VendorAddState(),
			edit: new VendorEditState(),
			remove: new VendorRemoveState(),
			list: new VendorListState(),
    };
	}
}

class VendorAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Vendors-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}
  
  formProxy(attrMap) {
		let proxy = {
			name: attrMap.name,
		};
    return proxy;
  }

	handleAdd(proxy) {
		this.context.project.addVendor(proxy);
		this.context.dirty = true;
	}
}

class VendorEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Vendors-Edit';
		this.filterFields = FILTER_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}
  
  filterProxys(attrMap) {
		let proxys = this.context.project.filterVendors(attrMap.name);
		return proxys;
	}
 
  formProxy(proxy, attrMap, skipMap) {
    let newProxy = Object.assign({}, proxy);
    if (!skipMap.name) { newProxy.name = attrMap.name; }
    return newProxy;
  }

	handleModify(proxy) {
		this.context.project.updateVendor(proxy);
		this.context.dirty = true;
	}
}

class VendorRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Vendors-Remove';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}
	
  filterProxys(attrMap) {
		let proxys = this.context.project.filterVendors(attrMap.name);
		return proxys;
	}

	handleRemove(proxy) {
		this.context.project.removeVendor(proxy.id);
		this.context.dirty = true;
	}
}

class VendorListState extends baseStates.ListState {
	constructor() {
		super();
		this.header = 'Vendors-List';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
	}
	
  filterProxys(attrMap) {
		let proxys = this.context.project.filterVendors(attrMap.name);
		return proxys;
	}
}

module.exports = {};
module.exports.VendorChooseActionState = VendorChooseActionState;
