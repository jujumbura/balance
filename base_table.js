var generator = require('./generator');

class BaseTable {
	constructor() {
		this.entries = [];
		this.entryMap = {};
	}

	receiveEntries() {
		return this.entries;
	}

	assignEntries(entries) {
		this.entries = entries;
		this.entryMap = {};
		console.log('assign');
		console.log(JSON.stringify(this.entries, null, 2));
		for (let i = 0; i < entries.length; ++i) {
			let entry = entries[i];
			this.entryMap[entry.id] = entry;
		}
	}

	add(params) {
		let id = generator.generateUUID();
		let entry = formEntry(id, params);
		this.entries.push(entry);
		this.entryMap[id] = entry;
	}

	get(id) {
		let entry = this.entryMap[id];
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
}

module.exports = BaseTable;
