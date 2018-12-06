var BaseTable = require('./base_table');

class GroupTable extends BaseTable {
	constructor() {
		super();

    this.named = true;
	}
	
	getName() { return 'Groups'; }

	formEntry(id, proxy) {
		let entry = {
			id: id,
			name: proxy.name,
			parentIds: proxy.parentIds,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
			name: entry.name,
      parentIds: entry.parentIds,
		};
		return proxy;
	}

  findWithParentId(parentId) {
		let proxys = [];
    this.entries.forEach(entry => {
      if (entry.parentIds && entry.parentIds.includes(parentId)) {
			  let proxy = this.formProxy(entry);
        proxys.push(proxy);
      }
    });
    return proxys;
  }
}

module.exports = GroupTable;
