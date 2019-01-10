var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
var InputError = require('./errors').InputError;
var DataError = require('./errors').DataError;
var StateCommand = require('./state_command');

const ALL_FIELDS = [
  { label: 'product',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'location',  usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'quantity',  usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'size',      usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'remain',    usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'acquired',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
  { label: 'disposed',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
];

const FILTER_FIELDS = [
  { label: 'product',   usage: Usage.OPTIONAL, type: Type.STRING },
  { label: 'location',  usage: Usage.OPTIONAL, type: Type.STRING },
  { label: 'disposed',  usage: Usage.OPTIONAL, type: Type.BOOL },
];

const USE_FIELDS = [
  { label: 'count',     usage: Usage.OPTIONAL, type: Type.NUMBER },
];

const CHANGE_FIELDS = [
  { label: 'product',   usage: Usage.OPTIONAL, type: Type.STRING, width: 20 },
  { label: 'remain',    usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'disposed',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
];

function makeCorrectionSpecs(project) {
  let specs = [
    { label: 'product', allowed: project.getAllProductNames() },
    { label: 'location', allowed: project.getAllLocationNames() },
  ];
  return specs;
}

class ItemChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Items';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
      { label: 'use' },
		];
		this.stateMap = {
			add: new ItemAddState(),
			edit: new ItemEditState(),
			remove: new ItemRemoveState(),
			list: new ItemListState(),
      use: new ItemUseState(),
    };
	}
}

class ItemAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Items-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

  formProxy(attrMap) {
    let proxy = {
			product: attrMap.product,
			location: attrMap.location,
			quantity: attrMap.quantity,
			size: attrMap.size,
      remain: attrMap.remain,
			acquired: attrMap.acquired,
      disposed: attrMap.disposed,
		};
    if (proxy.quantity === null) { proxy.quantity = 1 }
    if (proxy.size === null) { proxy.size = 1 }
    if (proxy.remain === null) { proxy.remain = proxy.quantity; }
    if (proxy.acquired === null) { proxy.acquired = new Date(); }
    return proxy;
  }

  makeCorrectionSpecs() {
    return makeCorrectionSpecs(this.context.project);
  }

	handleAdd(proxy) {
		this.context.project.addItem(proxy);
		this.context.dirty = true;
	}
}

class ItemEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Items-Edit';
		this.filterFields = FILTER_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

  formProxy(proxy, attrMap, skipMap) {
    let newProxy = Object.assign({}, proxy);
    if (!skipMap.product) { newProxy.product = attrMap.product; }
    if (!skipMap.location) { newProxy.location = attrMap.location; }
    if (!skipMap.quantity) { newProxy.quantity = attrMap.quantity; }
    if (!skipMap.size) { newProxy.size = attrMap.size; }
    if (!skipMap.remain) { newProxy.remain = attrMap.remain; }
    if (!skipMap.acquired) { newProxy.acquired = attrMap.acquired; }
    if (!skipMap.disposed) { newProxy.disposed = attrMap.disposed; }
    return newProxy;
  }
  
  makeCorrectionSpecs() {
    return makeCorrectionSpecs(this.context.project);
  }

	handleModify(proxy) {
		this.context.project.updateItem(proxy);
		this.context.dirty = true;
	}
}

class ItemRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Items-Remove';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

	handleRemove(proxy) {
		this.context.project.removeItem(proxy.id);
		this.context.dirty = true;
	}
}

class ItemListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Items-List';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
	}
	
	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}
}

class ItemUseState extends baseStates.BaseState {
	constructor() {
		super();
    this.header = 'Items-Use';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
    this.useFields = USE_FIELDS;
		this.changeFields = CHANGE_FIELDS;
	}
	
	async run () {
		this.writeHeader(this.header);
	
    let proxy = await this.selectProxy();

    while (true) {
      try {
        dialogHelper.printFields('? use', this.useFields);
        let results = await dialogHelper.submitFields(this.useFields);
		    let newProxy = this.useProxy(proxy, results.attrMap);
        dialogHelper.printProxy('- change', this.changeFields, newProxy);
        if (!await this.checkConfirm()) { continue; }
        this.handleChange(newProxy);
        break;
      } catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
      }
    }

		return new StateCommand(StateCommand.Type.BACK);
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

  useProxy(proxy, attrMap) {
    let usedProxy = Object.assign({}, proxy);
     if (attrMap.count !== null) {
      let remain = usedProxy.remain - attrMap.count;
      if (remain <= 0) {
        usedProxy.remain = 0;
        usedProxy.disposed = new Date();
      } else {
        usedProxy.remain = remain;
      }
    } else {
      usedProxy.remain = 0;
      usedProxy.disposed = new Date();
    }
    return usedProxy;
  }
	
	handleChange(proxy) {
		this.context.project.updateItem(proxy);
		this.context.dirty = true;
	}
}

module.exports = {};
module.exports.ItemChooseActionState = ItemChooseActionState;
module.exports.ALL_FIELDS = ALL_FIELDS;
