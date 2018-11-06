var ActionController = require('./action_controller');
var logger = require('./logger');

async function main() {
	console.log('main enter');
	let controller = new ActionController();
	await controller.run();
	console.log('main exit');
}

main();
