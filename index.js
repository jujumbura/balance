var StateController = require('./state_controller');
var logger = require('./logger');

async function main() {
  let projectPath = process.argv[2];

	let controller = new StateController();
	await controller.run(projectPath);
}

main();
