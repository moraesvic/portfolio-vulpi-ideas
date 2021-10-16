
CREATE TABLE indiv_translations (
	trans_id 			BIGINT NOT NULL
						REFERENCES translations(trans_id) ON DELETE CASCADE,
	lang_id				BIGINT NOT NULL
						REFERENCES languages(lang_id) ON DELETE CASCADE,
	trans_value			TEXT,
	
	CONSTRAINT pk_itrans PRIMARY KEY(trans_id, lang_id),
	CHECK ( 
		trans_value IS NOT NULL
		AND CHAR_LENGTH(trans_value) > 0
	)
);

/*############################################################################*/

CREATE INDEX idx_indiv_translations_trans_id ON indiv_translations(trans_id);

CREATE INDEX idx_indiv_translations_lang_id ON indiv_translations(lang_id);

/*############################################################################*/
CREATE OR REPLACE FUNCTION fn_trans_unavailable
(p_iso TEXT)
RETURNS TEXT AS
$$ DECLARE
	_trans TEXT;
BEGIN

	SELECT trans_value
		FROM indiv_translations it
		WHERE
			it.lang_id = 
				( SELECT lang_id FROM fn_lang_get_from_iso(p_iso) )
			AND it.trans_id =
			(
				SELECT trans_id
					FROM translations
					WHERE trans_label = 'translation-unavailable'
			)
		INTO _trans;

	IF _trans IS NULL THEN
		RETURN 'translation unavailable';
	ELSE
		RETURN _trans;
	END IF;

END; $$ LANGUAGE PLPGSQL;



/*############################################################################*/
/*
 * If p_iso is null, all translations will be returned for that id.
 *
 */

CREATE OR REPLACE FUNCTION fn_trans_get_by_id
(p_trans_id BIGINT, p_iso TEXT DEFAULT NULL)
RETURNS TABLE (
	iso TEXT,
	translation TEXT
) AS
$$ BEGIN

	RETURN QUERY
		SELECT
			COALESCE
			(
				lg.lang_iso1,
				lg.lang_iso2,
				lg.lang_iso3
			)::TEXT AS iso,
			it.trans_value AS translation
		FROM translations t
		JOIN indiv_translations it
			ON it.trans_id = t.trans_id
		JOIN languages lg
			ON lg.lang_id = it.lang_id
		WHERE
			t.trans_id = p_trans_id
			AND (
				p_iso is NULL
				OR lg.lang_id =
					( SELECT lang_id FROM fn_lang_get_from_iso(p_iso) )
			);

	IF NOT FOUND THEN
		RETURN QUERY
			SELECT p_iso, fn_trans_unavailable(p_iso)
			WHERE p_iso IS NOT NULL;
	END IF;
				
END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE PROCEDURE fn_trans_upsert_by_id
(p_id BIGINT,
p_iso_in TEXT,
p_trans_value TEXT) AS
$$ BEGIN
	IF CHAR_LENGTH(p_trans_value) = 0 THEN
		RAISE EXCEPTION 'Cannot enter an empty translation!';
	END IF;

	INSERT INTO indiv_translations(trans_id, lang_id, trans_value) VALUES
	(
		( SELECT trans_id FROM translations WHERE
			trans_id = p_id ),
		( SELECT lang_id FROM fn_lang_get_from_iso(p_iso_in) ),
		p_trans_value
	)
	ON CONFLICT(trans_id, lang_id)
		DO UPDATE
			SET trans_value = EXCLUDED.trans_value;

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/
/*#############################       API        #############################*/
/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_trans_upsert_by_label
(p_label TEXT,
p_iso_in TEXT,
p_trans_value TEXT) AS
$$ BEGIN
	IF CHAR_LENGTH(p_trans_value) = 0 THEN
		RAISE EXCEPTION 'Cannot enter an empty translation!';
	END IF;

	/* If translation object does not exist yet, create it */
	IF NOT EXISTS 
	( SELECT FROM translations WHERE trans_label = p_label ) THEN
		INSERT INTO translations (trans_label) VALUES (p_label);
	END IF;

	INSERT INTO indiv_translations(trans_id, lang_id, trans_value) VALUES
	(
		( SELECT trans_id FROM translations WHERE
			trans_label = p_label ),
		( SELECT lang_id FROM fn_lang_get_from_iso(p_iso_in) ),
		p_trans_value
	)
	ON CONFLICT(trans_id, lang_id)
		DO UPDATE
			SET trans_value = EXCLUDED.trans_value;

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE FUNCTION api_trans_get_by_label
(p_label TEXT, p_iso TEXT DEFAULT NULL)
RETURNS TABLE (
	iso TEXT,
	translation TEXT
) AS
$$ BEGIN

	RETURN QUERY
		SELECT
			COALESCE
			(
				lg.lang_iso1,
				lg.lang_iso2,
				lg.lang_iso3
			) AS iso,
			it.trans_value AS translation
		FROM translations t
		JOIN indiv_translations it
			ON it.trans_id = t.trans_id
		JOIN languages lg
			ON lg.lang_id = it.lang_id
		WHERE
			t.trans_label = p_label
			AND (
				p_iso is NULL
				OR lg.lang_id =
					( SELECT lang_id FROM fn_lang_get_from_iso(p_iso) )
			);

	IF NOT FOUND THEN
		RETURN QUERY
			SELECT p_iso, fn_trans_unavailable(p_iso);
	END IF;

END; $$ LANGUAGE PLPGSQL;

