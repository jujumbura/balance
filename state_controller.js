var storage = require('./storage');
var generalStates = require('./general_states');
var StateCommand = require('./state_command');
var logger = require('./logger');
var Project = require('./project');

class StateController {
	constructor() {
		this.stateStack = [];
	}

	async run() {
		logger.trace('StateController.run begin');
		
		let path = '/Users/michael.kron/Projects/balance/projects/TestProject';
		let project = new Project();
		storage.loadProject(path, project);

		let context = {
			project: project,
			dirty: false,
		};

		let state = new generalStates.SelectModeState();
		while (true) {
			state.context = context;

			let command = state.run();
			
			if (context.dirty) {
				storage.storeProject(path, project);
				context.dirty = false;
			}
			
			if (command.type == StateCommand.Type.Quit) {
				break;
			} else if (command.type == StateCommand.Type.Back) {
				if (this.stateStack.length > 0) {
					state = this.stateStack.pop();
				} else {
					io.writeMessage('Cannot go back farther');
				}
				continue;
			} else if (command.type == StateCommand.Type.Continue) {
				continue;
			} else if (command.type == StateCommand.Type.Next {
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
