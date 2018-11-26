var BaseTable = require('./base_table');

class ItemTable extends BaseTable {
	constructor() {
		super();
	}

	getName() { return 'Items'; }

	formEntry(id, params) {
		let entry = {
			id: id,
			productId: params.productId,
      quantity: params.quantity,
      remain: params.remain,
      acquireDate: params.acquireDate,
      disposeDate: params.disposeDate,
		};
		return entry;	
	}

	formDesc(entry) {
		let desc = {
			id: entry.id,
			productId: entry.productId,
      quantity: entry.quantity,
      remain: entry.remain,
      acquireDate: entry.acquireDate,
      disposeDate: entry.disposeDate,
		};
		return desc;
	}
}

module.exports = ItemTable;
