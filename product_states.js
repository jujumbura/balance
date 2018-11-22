var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;

const FIELDS = [
  { label: 'name', usage: Usage.REQUIRED },
  { label: 'groups', usage: Usage.MULTIPLE },
];

class ProductChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.message = '[Products] Choose';
		this.options = [
			{ label: 'add', state: new ProductAddState() },
			{ label: 'edit', state: new ProductEditState() },
			{ label: 'list', state: new ProductListState() },
		];
	}
}

class ProductAddState extends baseStates.AddState {
	constructor() {
		super();
		this.message = '[Products-Add] Enter';
		this.fields = FIELDS;
	}

	handleAdd(attrs) {
		let params = {
			name: attrs[0],
			groups: attrs[1],
		};
		this.context.project.addProduct(params);
		this.context.dirty = true;
	}
}

class ProductEditState extends baseStates.EditState {
	constructor() {
		super();
		this.findMessage = '[Products-Edit] Find';
		this.modifyMessage = '[Products-Edit] Modify';
		this.fields = FIELDS;
	}

	findObj(value) {
		let desc = this.context.project.findProduct(value);
		return desc;
	}

	handleModify(obj, attrs) {
		let params = {
			name: attrs[0],
			groups: attrs[1],
		};
		this.context.project.updateProduct(obj.id, params);
		this.context.dirty = true;
	}
}

class ProductListState extends baseStates.ListState {
	constructor() {
		super();
    this.filterMessage = '[Products-List] Filter';
		this.message = '[Products-List] ';
    this.filterFields = [
      { label: 'group', usage: Usage.OPTIONAL },
    ];
		this.listFields = FIELDS;
	}
	
	produceObjs(attrs) {
		let productDescs = this.context.project.filterProducts(attrs[0]);
		return productDescs;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
