var StateController = require('./state_controller');
var logger = require('./logger');

async function main() {
	let controller = new StateController();
	await controller.run();
}

main();
