CREATE TYPE priviledge AS ENUM(
	'NORMAL',
	'ADMIN',
	'SUPERUSER'
);

CREATE TABLE users(
	user_id 			BIGSERIAL NOT NULL PRIMARY KEY,
	user_name 			TEXT NOT NULL UNIQUE,
	user_hash 			TEXT NOT NULL,
	user_creation 		TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	user_last_login		TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	user_priviledge		priviledge NOT NULL DEFAULT 'NORMAL' ::priviledge,
	CHECK(CHAR_LENGTH(user_name) BETWEEN 6 AND 14)
);

CREATE TABLE user_tokens(
	user_id			BIGINT NOT NULL
					REFERENCES users(user_id) ON DELETE CASCADE,
	tok_token		TEXT NOT NULL,
	tok_expires		TIMESTAMPTZ NOT NULL,
	CONSTRAINT pk_utokens PRIMARY KEY(user_id, tok_token)
);

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_new
(p_uname TEXT, p_hash TEXT) RETURNS SETOF users AS
$$ BEGIN

	/* Hashing and validation will be done by the application */
	RETURN QUERY
		INSERT INTO users (user_name, user_hash)
			VALUES (p_uname, p_hash)
			RETURNING *;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_set_priviledge
(p_uname TEXT, p_priviledge TEXT)
RETURNS SETOF users AS
$$ BEGIN

	RETURN QUERY
		UPDATE users
			SET
				user_priviledge = p_priviledge::priviledge
			WHERE
				user_name = p_uname
			RETURNING *;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_find_by_credentials
(p_uname TEXT, p_hash TEXT) RETURNS SETOF users AS
$$ BEGIN

	RETURN QUERY
		SELECT *
		FROM users
		WHERE
			user_name = p_uname
			AND user_hash = p_hash;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_find_by_uname
(p_uname TEXT) RETURNS SETOF users AS
$$ BEGIN

	RETURN QUERY
		SELECT *
		FROM users
		WHERE
			user_name = p_uname;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_check_if_auth
(p_uname TEXT, p_token TEXT)
RETURNS SETOF users AS
$$ BEGIN

	RETURN QUERY
		SELECT users.*
		FROM users
		NATURAL JOIN user_tokens
		WHERE
			users.user_name = p_uname
			AND user_tokens.tok_token = p_token
			AND user_tokens.tok_expires >= NOW();

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_remove_old_tokens
(OUT o_removed_tokens INT) AS
$$ BEGIN

	WITH deleted AS
	(
		DELETE
		FROM user_tokens
		WHERE tok_expires < NOW()
		RETURNING *
	)
	SELECT COUNT(*)
	FROM deleted
	INTO o_removed_tokens;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_logout
(IN p_uname TEXT, IN p_token TEXT, OUT o_removed_tokens INT) AS
$$ BEGIN

	WITH deleted AS
	(
		DELETE
		FROM user_tokens
		WHERE
			user_id IN
			(
				SELECT user_id
					FROM users
					WHERE user_name = p_uname
			)
			AND tok_token = p_token
		RETURNING *
	)
	SELECT COUNT(*)
	FROM deleted
	INTO o_removed_tokens;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_logout_all
(IN p_uname TEXT, OUT o_removed_tokens INT) AS
$$ BEGIN

	WITH deleted AS
	(
		DELETE
		FROM user_tokens
		WHERE
			user_id IN
			(
				SELECT user_id
					FROM users
					WHERE user_name = p_uname
			)
		RETURNING *
	)
	SELECT COUNT(*)
	FROM deleted
	INTO o_removed_tokens;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_user_add_token
(p_uname TEXT, p_token TEXT, p_expires TIMESTAMPTZ)
RETURNS SETOF user_tokens AS
$$ BEGIN

	RETURN QUERY
		INSERT INTO user_tokens
		(user_id, tok_token, tok_expires)
		(
			SELECT user_id, p_token, p_expires
				FROM users
				WHERE user_name = p_uname
		)
		RETURNING *;

END; $$ LANGUAGE plpgsql;