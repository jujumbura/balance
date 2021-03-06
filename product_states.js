var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
		
const ALL_FIELDS = [
  { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING, width: 40 },
  { label: 'groups',  usage: Usage.MULTIPLE, type: Type.STRING, width: 40 },
  { label: 'desired', usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
];

const FILTER_FIELDS = [
  { label: 'name',    usage: Usage.OPTIONAL, type: Type.STRING },
  { label: 'groups',  usage: Usage.MULTIPLE, type: Type.STRING },
];

function makeCorrectionSpecs(project) {
  let specs = [
    { label: 'groups',  allowed: project.getAllGroupNames() },
  ];
  return specs;
}

function makeFilterCorrectionSpecs(project) {
  let specs = [
    { label: 'name',    allowed: project.getAllProductNames() },
    { label: 'groups',  allowed: project.getAllGroupNames() },
  ];
  return specs;
}

class ProductChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Products';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
		];
    this.stateMap = {
			add: new ProductAddState(),
			edit: new ProductEditState(),
			remove: new ProductRemoveState(),
			list: new ProductListState(),
    };
	}
}

class ProductAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Products-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

  formProxy(attrMap) {
		let proxy = {
			name: attrMap.name,
			groups: attrMap.groups,
      desired: attrMap.desired,
		};
    return proxy;
  }
  
  makeCorrectionSpecs() {
    return makeCorrectionSpecs(this.context.project);
  }

	handleAdd(proxy) {
		this.context.project.addProduct(proxy);
		this.context.dirty = true;
	}
}

class ProductEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Products-Edit';
		this.filterFields = FILTER_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}
  
  makeFilterCorrectionSpecs() {
    return makeFilterCorrectionSpecs(this.context.project);
  }
	
  filterProxys(attrMap, skipMap) {
		let proxys = this.context.project.filterProducts(attrMap, skipMap);
	  return proxys;
  }
  
  formProxy(proxy, attrMap, skipMap) {
    let newProxy = Object.assign({}, proxy);
    if (!skipMap.name) { newProxy.name = attrMap.name; }
    if (!skipMap.groups) { newProxy.groups = attrMap.groups; }
    if (!skipMap.desired) { newProxy.desired = attrMap.desired; }
    return newProxy;
  }
  
  makeCorrectionSpecs() {
    return makeCorrectionSpecs(this.context.project);
  }
  
	handleModify(proxy) {
		this.context.project.updateProduct(proxy);
		this.context.dirty = true;
	}
}

class ProductRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Products-Remove';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}

  filterProxys(attrMap) {
		let proxy = this.context.project.findProduct(attrMap.name);
		return [ proxy ];
	}

	handleRemove(proxy) {
		this.context.project.removeProduct(proxy.id);
		this.context.dirty = true;
	}
}

class ProductListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Products-List';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
	}
  
  makeFilterCorrectionSpecs() {
    return makeFilterCorrectionSpecs(this.context.project);
  }
	
	filterProxys(attrMap, skipMap) {
		let proxys = this.context.project.filterProducts(attrMap, skipMap);
		return proxys;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
