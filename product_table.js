var BaseTable = require('./base_table');

class ProductTable extends BaseTable {
	constructor() {
		super();
	}

	getName() { return 'Products'; }

	formEntry(id, params) {
		let entry = {
			id: id,
			name: params.name,
		};
		return entry;	
	}

	formDesc(entry) {
		let desc = {
			id: entry.id,
			name: entry.name,
		};
		return desc;
	}
}

module.exports = ProductTable;
