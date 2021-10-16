CREATE TABLE languages (
	lang_id 			BIGSERIAL NOT NULL PRIMARY KEY,
	lang_iso1 			CHAR(2) UNIQUE,
	lang_iso2 			CHAR(3) UNIQUE,
	lang_iso3 			CHAR(3) UNIQUE,
	lang_iso			TEXT GENERATED ALWAYS AS
						(COALESCE(lang_iso1, lang_iso2, lang_iso3))
						STORED UNIQUE,
	trans_id			BIGINT NOT NULL UNIQUE 
						REFERENCES translations(trans_id) ON DELETE CASCADE,
	CHECK
	(
			lang_iso1 IS NOT NULL
		OR	lang_iso2 IS NOT NULL
		OR	lang_iso3 is NOT NULL
	),
	CHECK (lang_iso1 ~ '^[a-z]{2}$'),
	CHECK (lang_iso2 ~ '^[a-z]{3}$'),
	CHECK (lang_iso3 ~ '^[a-z]{3}$')
);

/*############################################################################*/

CREATE UNIQUE INDEX idx_u_languages ON languages(lang_iso);

/*############################################################################*/

CREATE OR REPLACE FUNCTION tgfn_lang_insert()
RETURNS TRIGGER AS
$$
DECLARE
	_trans_id BIGINT;
BEGIN
	/* If trying to insert empty string, just use a null pointer instead */
	IF CHAR_LENGTH(NEW.lang_iso1) = 0 THEN
		NEW.lang_iso1 := NULL;
	END IF;
	IF CHAR_LENGTH(NEW.lang_iso2) = 0 THEN
		NEW.lang_iso2 := NULL;
	END IF;
	IF CHAR_LENGTH(NEW.lang_iso3) = 0 THEN
		NEW.lang_iso3 := NULL;
	END IF;

	IF NEW.trans_id IS NOT NULL THEN
		RETURN NEW;
	END IF;

	INSERT INTO translations
		DEFAULT VALUES
		RETURNING trans_id
		INTO _trans_id;

	NEW.trans_id := _trans_id;
	RETURN NEW;

END; $$ LANGUAGE plpgsql;

CREATE TRIGGER tg_lang_insert
BEFORE INSERT ON languages
FOR EACH ROW EXECUTE PROCEDURE tgfn_lang_insert();

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_lang_get_from_iso
(p_iso TEXT)
RETURNS SETOF languages AS
$$
BEGIN
	RETURN QUERY SELECT *
		FROM languages
		WHERE
			lang_iso1 = p_iso
			OR lang_iso2 = p_iso
			OR lang_iso3 = p_iso;
END;
$$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION fn_lang_get_iso
(IN p_lang_id BIGINT, OUT o_iso TEXT) AS
$$ BEGIN

	SELECT lang_iso
		INTO o_iso
		FROM languages
		WHERE lang_id = p_lang_id;

END;
$$ LANGUAGE plpgsql;

/*############################################################################*/
/*#############################       API        #############################*/
/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_lang_insert
(p_iso1 CHAR(2),
p_iso2 CHAR(3) DEFAULT NULL,
p_iso3 CHAR(3) DEFAULT NULL) AS
$$ BEGIN
	INSERT
		INTO languages
			(lang_iso1, lang_iso2, lang_iso3) VALUES
			(p_iso1, p_iso2, p_iso3);
END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_lang_upsert_trans
(p_iso_for TEXT,
p_iso_in TEXT,
p_trans_value TEXT) AS
$$ BEGIN
	INSERT INTO indiv_translations(trans_id, lang_id, trans_value) VALUES
	(
		( SELECT trans_id FROM fn_lang_get_from_iso(p_iso_for) ),
		( SELECT lang_id FROM fn_lang_get_from_iso(p_iso_in) ),
		p_trans_value
	)
	ON CONFLICT(trans_id, lang_id)
		DO UPDATE
			SET trans_value = EXCLUDED.trans_value;

END; $$ LANGUAGE PLPGSQL;

/*############################################################################*/

CREATE OR REPLACE FUNCTION api_lang_get_trans
(p_iso_for TEXT, p_iso_in TEXT DEFAULT NULL)
RETURNS TABLE (
	iso TEXT,
	translation TEXT
) AS
$$
BEGIN
	RETURN QUERY SELECT
		*
	FROM fn_trans_get_by_id(
		( SELECT lang_id FROM fn_lang_get_from_iso(p_iso_for) ),
		p_iso_in
	);
END;
$$ LANGUAGE plpgsql;