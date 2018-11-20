var BaseTable = require('./base_table');

class GroupTable extends BaseTable {
	constructor() {
		super();
	}
	
	getName() { return 'Groups'; }

	formEntry(id, params) {
		let entry = {
			id: id,
			name: params.name,
			parentIds: params.parentIds,
		};
		return entry;	
	}

	formDesc(entry) {
		let desc = {
			id: entry.id,
			name: entry.name,
      parentIds: entry.parentIds,
		};
		return desc;
	}
}

module.exports = GroupTable;
