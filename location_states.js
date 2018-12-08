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

class LocationChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Locations';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
		];
		this.stateMap = {
			add: new LocationAddState(),
			edit: new LocationEditState(),
			remove: new LocationRemoveState(),
			list: new LocationListState(),
    };
	}
}

class LocationAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Locations-Add';
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
		this.context.project.addLocation(proxy);
		this.context.dirty = true;
	}
}

class LocationEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Locations-Edit';
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}
  
  filterProxys() {
		let proxys = this.context.project.getAllLocations();
		return proxys;
	}
 
  formProxy(proxy, attrMap) {
    let newProxy = Object.assign({}, proxy);
    if (attrMap.name) { newProxy.name = attrMap.name; }
    return newProxy;
  }

	handleModify(proxy) {
		this.context.project.updateLocation(proxy);
		this.context.dirty = true;
	}
}

class LocationRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Locations-Remove';
    this.listFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}
	
  filterProxys() {
		let proxys = this.context.project.getAllLocations();
		return proxys;
	}

	handleRemove(proxy) {
		this.context.project.removeLocation(proxy.id);
		this.context.dirty = true;
	}
}

class LocationListState extends baseStates.ListState {
	constructor() {
		super();
		this.header = 'Locations-List';
		this.listFields = ALL_FIELDS;
	}
	
	filterProxys() {
		let proxys = this.context.project.getAllLocations();
		return proxys;
	}
}

module.exports = {};
module.exports.LocationChooseActionState = LocationChooseActionState;
