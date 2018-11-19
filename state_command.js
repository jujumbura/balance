
class StateCommand {
	constructor(type, nextState) {
		this.type = type;
		this.nextState = nextState;
	}
}

let Type = {
	Next: 'Next',
	Back: 'Back',
	Retry: 'Retry',
	Quit: 'Quit',
};

StateCommand.Type = Type;

module.exports = StateCommand;
