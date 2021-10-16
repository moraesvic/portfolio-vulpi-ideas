CREATE TABLE IF NOT EXISTS parts_of_speech (
	pos_id		SERIAL NOT NULL PRIMARY KEY,
	pos_title	TEXT NOT NULL UNIQUE,
	trans_id 	BIGINT NOT NULL
				REFERENCES translations(trans_id)
				ON DELETE CASCADE,

	CHECK ( CHAR_LENGTH(pos_title) > 0 )
);

/*############################################################################*/

CREATE OR REPLACE FUNCTION tgfn_pos_insert()
RETURNS TRIGGER AS
$$
DECLARE
	_trans_id BIGINT;
BEGIN
	IF NEW.trans_id IS NOT NULL THEN
		RETURN NEW;
	END IF;

	INSERT INTO translations
		DEFAULT VALUES
		RETURNING trans_id
		INTO _trans_id;

	NEW.trans_id := _trans_id;
	RETURN NEW;

END; $$ LANGUAGE PLPGSQL;

CREATE TRIGGER tg_pos_insert
BEFORE INSERT ON parts_of_speech
FOR EACH ROW EXECUTE PROCEDURE tgfn_pos_insert();

/*############################################################################*/
/*#############################       API        #############################*/
/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_pos_insert
(p_label TEXT) AS
$$ DECLARE
	_trans_id BIGINT;
BEGIN
	IF CHAR_LENGTH(p_label) = 0 THEN
		RAISE EXCEPTION 'Label cannot be empty!';
	END IF;

	INSERT
		INTO parts_of_speech
		(pos_title)
		VALUES
		(p_label)
		RETURNING trans_id
		INTO _trans_id;

	UPDATE translations
		SET trans_label = 'pos-' || p_label
		WHERE trans_id = _trans_id;

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE FUNCTION api_pos_get_trans
(p_iso TEXT DEFAULT NULL) RETURNS TABLE (
	pos TEXT,
	iso TEXT,
	translation TEXT
) AS
$$ DECLARE
	r RECORD;
	s RECORD;
BEGIN
	CREATE TEMPORARY TABLE tmp_api_pos_get_trans (
		pos TEXT,
		iso TEXT,
		translation TEXT
	);

	FOR r IN
		SELECT
			p.trans_id AS trans_id,
			p.pos_title AS pos_title
			FROM parts_of_speech p
			JOIN translations t
				ON p.trans_id = t.trans_id
	LOOP
		FOR s IN
			SELECT fn.iso, fn.translation
				FROM fn_trans_get_by_id
				(
					r.trans_id,
					p_iso
				) fn
		LOOP
			INSERT
				INTO tmp_api_pos_get_trans (pos, iso, translation)
				VALUES
				(r.pos_title, s.iso, s.translation);
		END LOOP;
	END LOOP;

	RETURN QUERY SELECT *
		FROM tmp_api_pos_get_trans;
	
	DROP TABLE tmp_api_pos_get_trans;
	RETURN;

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_pos_upsert_trans
(p_label TEXT,
p_iso TEXT,
p_value TEXT) AS
$$ DECLARE
	_trans_id BIGINT;
BEGIN
	SELECT trans_id
		FROM translations
		WHERE trans_label = 'pos-' || p_label
		INTO _trans_id;
	
	CALL fn_trans_upsert_by_id(_trans_id, p_iso, p_value);

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_pos_insert_traditional
() AS
$$ BEGIN

	CALL api_pos_insert('noun');
	CALL api_pos_upsert_trans('noun', 'en', 'noun');
	CALL api_pos_insert('verb');
	CALL api_pos_upsert_trans('verb', 'en', 'verb');
	CALL api_pos_insert('adjective');
	CALL api_pos_upsert_trans('adjective', 'en', 'adjective');
	CALL api_pos_insert('adverb');
	CALL api_pos_upsert_trans('adverb', 'en', 'adverb');
	CALL api_pos_insert('pronoun');
	CALL api_pos_upsert_trans('pronoun', 'en', 'pronoun');
	CALL api_pos_insert('preposition');
	CALL api_pos_upsert_trans('preposition', 'en', 'preposition');
	CALL api_pos_insert('conjunction');
	CALL api_pos_upsert_trans('conjunction', 'en', 'conjunction');
	CALL api_pos_insert('interjection');
	CALL api_pos_upsert_trans('interjection', 'en', 'interjection');
	CALL api_pos_insert('article');
	CALL api_pos_upsert_trans('article', 'en', 'article');
	CALL api_pos_insert('numeral');
	CALL api_pos_upsert_trans('numeral', 'en', 'numeral');
	CALL api_pos_insert('participle');
	CALL api_pos_upsert_trans('participle', 'en', 'participle');

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/