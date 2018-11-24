var storage = require('./storage');
var generalStates = require('./general_states');
var StateCommand = require('./state_command');
var Project = require('./project');
var io = require('./console_io');
var logger = require('./logger');
var AbortError = require('./errors').AbortError;

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

			let command = null;
			try {
				command = await state.run();
			} catch (e) {
       	if (e instanceof AbortError) {
					if (e.type === AbortError.Type.QUIT) {
						command = new StateCommand(StateCommand.Type.QUIT); 
					} else if (e.type === AbortError.Type.BACK) {
						command = new StateCommand(StateCommand.Type.BACK); 
					} else {
						throw e;
					}
        } else {
          throw e;
        }
			}
			
			if (context.dirty) {
				storage.storeProject(projectPath, project);
				context.dirty = false;
			}
			
			if (command.type === StateCommand.Type.QUIT) {
				io.writeMessage('> quitting');
				io.writeMessage('');
				break;
			} else if (command.type === StateCommand.Type.BACK) {
				if (this.stateStack.length > 0) {
					io.writeMessage('> going back');
					state = this.stateStack.pop();
				} else {
					io.writeMessage('> cannot go back, returning');
				}
				io.writeMessage('');
				continue;
			} else if (command.type == StateCommand.Type.RETRY) {
        io.writeMessage('');
				continue;
			} else if (command.type == StateCommand.Type.NEXT) {
				this.stateStack.push(state);
				state = command.nextState;
			} else {
				throw new Error('Unhandled command: ' + command.type);
			}
      io.writeMessage('');
		}

		logger.trace('StateController.run end');
	}
}

module.exports = StateController;
