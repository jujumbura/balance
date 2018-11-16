var storage = require('./storage');
var generalStates = require('./general_states');
var StateCommand = require('./state_command');
var Project = require('./project');
var io = require('./console_io');
var logger = require('./logger');

class StateController {
	constructor() {
		this.stateStack = [];
	}

	async run(projectPath) {
		logger.trace('StateController.run begin');
		
		let project = new Project();
		storage.loadProject(projectPath, project);

		let context = {
			project: project,
			dirty: false,
		};

		let state = new generalStates.ChooseModeState();
		while (true) {
			state.context = context;

			let command = await state.run();
			
			if (context.dirty) {
				storage.storeProject(path, project);
				context.dirty = false;
			}
			
			if (command.type == StateCommand.Type.Quit) {
				break;
			} else if (command.type == StateCommand.Type.Back) {
        console.log('got back command');
				if (this.stateStack.length > 0) {
					state = this.stateStack.pop();
				} else {
					io.writeMessage('Cannot go back farther');
				}
				continue;
			} else if (command.type == StateCommand.Type.Continue) {
				continue;
			} else if (command.type == StateCommand.Type.Next) {
				this.stateStack.push(state);
				state = command.nextState;
			} else {
				throw new Error();
			}
		}

		logger.trace('StateController.run end');
	}
}

module.exports = StateController;
