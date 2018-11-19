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
			groupIds: params.groupIds,
		};
		return entry;	
	}

	formDesc(entry) {
		let desc = {
			id: entry.id,
			name: entry.name,
			groupIds: entry.groupIds,
		};
		return desc;
	}
}

module.exports = ProductTable;
