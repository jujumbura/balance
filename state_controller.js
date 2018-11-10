var io = require('./console_io');
var storage = require('./storage');
var states = require('./states');
var logger = require('./logger');
var Project = require('./project');

class StateController {
	constructor() {
		this.stateStack = [];
	}

	async run() {
		logger.trace('StateController.run');
		
		let path = '/Users/michael.kron/Projects/balance/projects/TestProject';
		let project = new Project();
		storage.loadProject(path, project);

		let context = {
			project: project,
			dirty: false,
		};

		let state = states.createInitialState();
		while (true) {
			state.context = context;

			io.writeMessage(state.getMessage());

			let values = await io.readValues();
			if (values.length != 1) {
				io.writeMessage('Expected 1 value');
				continue;
			}
			if (this.checkQuit(values)) {
				break;
			}
			if (this.checkBack(values)) {
				if (this.stateStack.length > 0) {
					state = this.stateStack.pop();
				} else {
					io.writeMessage('Cannot go back farther');
				}
				continue;
			}

			let nextState = state.handleInput(values);
			if (context.dirty) {
				storage.storeProject(path, project);
				context.dirty = false;
			}
			if (nextState) {
				this.stateStack.push(state);
				state = nextState;
			}
		}
	}

	checkQuit(values) {
		switch (values[0]) {
			case 'quit':
			case 'q':
				return true;
			default:
				return false;
		}
	}
	
	checkBack(values) {
		switch (values[0]) {
			case 'back':
			case 'b':
				return true;
			default:
				return false;
		}
	}
}

module.exports = StateController;
