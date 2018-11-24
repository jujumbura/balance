
const Type = {
	NEXT: 'Next',
	BACK: 'Back',
	RETRY: 'Retry',
	QUIT: 'Quit',
};
class StateCommand {
	constructor(type, nextState) {
		this.type = type;
		this.nextState = nextState;
	}
}
StateCommand.Type = Type;

module.exports = StateCommand;
