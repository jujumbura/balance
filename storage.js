var fs = require('fs');
var fsExtra = require('fs-extra');
var logger = require('./logger');

function storeTable(projectPath, table) {
	let dataPath = projectPath + '/' + table.getName() + '.json';
	let entries = table.receiveEntries();
	let data = JSON.stringify(entries, null, 2);
	fs.writeFileSync(dataPath, data);
}

function loadTable(projectPath, table) {
	let dataPath = projectPath + '/' + table.getName() + '.json';
	let data = fs.readFileSync(dataPath);
	let entries = JSON.parse(data);
	table.assignEntries(entries);
}

function storeProject(path, project) {
	fsExtra.mkdirs(path);
	let tables = project.getTables();
	for (let i = 0; i < tables.length; ++i) {
		let table = tables[i];
		storeTable(path, table);
	}
}

function loadProject(path, project) {
	if (fsExtra.pathExistsSync(path)) {
		let tables = project.getTables();
		for (let i = 0; i < tables.length; ++i) {
			let table = tables[i];
			loadTable(path, table);
		}
    project.fixup();
	}
}

module.exports = {};
module.exports.storeProject = storeProject;
module.exports.loadProject = loadProject;
