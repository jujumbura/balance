var fs = require('fs');
var fsExtra = require('fs-extra');
var logger = require('./logger');

function storeProject(path, project) {
	fsExtra.mkdirs(path);
	let dataPath = path + '/products.json';
	let entries = project.retrieveProductEntries();
	let data = JSON.stringify(entries, null, 2);
	fs.writeFileSync(dataPath, data);
}

function loadProject(path, project) {
	if (fsExtra.pathExistsSync(path)) {
		let dataPath = path + '/products.json';
		let data = fs.readFileSync(dataPath);
		let entries = JSON.parse(data);
		project.assignProductEntries(entries);
	}
}

module.exports = {};
module.exports.storeProject = storeProject;
module.exports.loadProject = loadProject;
