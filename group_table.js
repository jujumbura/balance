var generator = require('./generator');

class ProductTable {
	constructor() {
		this.entries = [];
		this.entryTable = {};
	}

	getEntries() {
		return this.entries;
	}

	setEntries(entries) {
		this.entries = entries;
	}

	add(params) {
		let id = generator.generateUUID();
		let entry = {
			id: id,
			name: params.name,
		};
		this.entries.push(entry);
	}

	get(id) {
		let entry = this.entryTable[id];
		let desc = formDesc(entry);
		return desc;
	}

	getAll() {
		let descs = [];
		for (let i = 0; i < this.entries.length; ++i) {
			let entry = this.entries[i];
			let desc = this.formDesc(entry);
			descs.push(desc);
		}
		return descs;
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
