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
				storage.storeProject(projectPath, project);
				context.dirty = false;
			}
			
			if (command.type == StateCommand.Type.Quit) {
				io.writeMessage('-Quitting');
				break;
			} else if (command.type == StateCommand.Type.Back) {
				if (this.stateStack.length > 0) {
					io.writeMessage('-Going back');
					state = this.stateStack.pop();
				} else {
					io.writeMessage('-Cannot go back farther');
				}
        io.writeMessage('');
				continue;
			} else if (command.type == StateCommand.Type.Continue) {
				continue;
			} else if (command.type == StateCommand.Type.Next) {
				this.stateStack.push(state);
				state = command.nextState;
			} else {
				throw new Error();
			}
      io.writeMessage('');
		}

		logger.trace('StateController.run end');
	}
}

module.exports = StateController;
