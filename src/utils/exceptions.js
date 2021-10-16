class InvalidInput extends Error {
	constructor(message) {
		super(message);
		this.name = 'InvalidInput';
	}
};

class AlreadyExistent extends Error {
	constructor(message) {
		super(message);
		this.name = 'AlreadyExistent';
	}
};

class TokenExpired extends Error {
	constructor(message) {
		super(message);
		this.name = 'TokenExpired';
	}
}

class InvalidCredentials extends Error {
	constructor(message) {
		super(message);
		this.name = 'InvalidCredentials';
	}
}

class WrongPriviledges extends Error {
	constructor(message) {
		super(message);
		this.name = 'WrongPriviledges';
	}
}

class InexistentResource extends Error {
	constructor(message) {
		super(message);
		this.name = 'InexistentResource';
	}
}

class UserInputRequired extends Error {
	constructor(message) {
		super(message);
		this.name = 'UserInputRequired';
	}
}

class ErrorWithinError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ErrorWithinError';
	}
}

module.exports = {
	AlreadyExistent: AlreadyExistent,
	ErrorWithinError: ErrorWithinError,
	InexistentResource: InexistentResource,
	InvalidCredentials: InvalidCredentials,
	InvalidInput: InvalidInput,
	TokenExpired: TokenExpired,
	UserInputRequired: UserInputRequired,
	WrongPriviledges: WrongPriviledges
}