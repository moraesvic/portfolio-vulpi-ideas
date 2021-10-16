CREATE TABLE IF NOT EXISTS lemmas (
	lemma_id 	BIGSERIAL NOT NULL PRIMARY KEY,
	lang_id		BIGINT NOT NULL
				REFERENCES languages(lang_id) ON DELETE CASCADE,
	lemma_title TEXT NOT NULL,

	CHECK( CHAR_LENGTH(lemma_title) > 0 )
	
	/* to do */

	-- etymology
	-- IPA
	-- audio
);

/*############################################################################*/

CREATE TABLE IF NOT EXISTS senses (
	sense_id	BIGSERIAL NOT NULL PRIMARY KEY,
	lemma_id	BIGINT NOT NULL
				REFERENCES lemmas(lemma_id) ON DELETE CASCADE,

	-- part of speech to which it refers
	pos_id		INT NOT NULL
				REFERENCES parts_of_speech(pos_id) ON DELETE CASCADE,
	
	-- definition of the sense
	-- i.e. cat: "a feline which scratches and bites"
	sense_def	BIGINT NOT NULL
				REFERENCES translations(trans_id) ON DELETE CASCADE
);

/*############################################################################*/

CREATE TABLE IF NOT EXISTS sense_translations (
	-- Translation of the lemma when it means a specific sense
	-- i.e. cat - gato, but not when cat means a jazz musician

	-- It is sometimes hard to pinpoint to which SENSE of a foreign LEMMA
	-- a SENSE of one language should correspond.

	-- Therefore, we will only point to a lemma.

	sense_id	BIGINT NOT NULL
				REFERENCES senses(sense_id) ON DELETE CASCADE,
	lemma_id	BIGINT NOT NULL
				REFERENCES lemmas(lemma_id) ON DELETE CASCADE,

	CONSTRAINT pk_strans PRIMARY KEY(sense_id, lemma_id)
);

/*############################################################################*/

CREATE TABLE IF NOT EXISTS sense_trans_impossible (
	-- Not all words can be translated to every language.
	-- If a sense cannot be translated into a language, mark them here.

	sense_id	BIGINT NOT NULL
				REFERENCES senses(sense_id) ON DELETE CASCADE,
	lang_id		BIGINT NOT NULL
				REFERENCES languages(lang_id) ON DELETE CASCADE,

	CONSTRAINT pk_strimp PRIMARY KEY(sense_id, lang_id)
);

/*############################################################################*/

CREATE OR REPLACE PROCEDURE sp_lemma_insert
(p_lang_iso TEXT, p_lemma_title TEXT) AS
$$ BEGIN

	INSERT INTO lemmas
		(lang_id, lemma_title)
		VALUES
		(
			(
				SELECT lang_id
					FROM fn_lang_get_from_iso(p_lang_iso)
			),
			p_lemma_title
		);

	COMMIT;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE VIEW v_lemmas_senses_translations
AS
WITH my_data AS (  
	WITH cte AS 
		(
			SELECT lang_id, lang_iso
			FROM languages
		)
	SELECT
		l.lemma_id AS "lemma_id",
		l.lemma_title AS "lemma_title",
		fn_lang_get_iso(l.lang_id) AS "lemma_iso",
		s.sense_id AS "sense_id",
		p.pos_title AS "pos_title",
		cte.lang_iso AS "translation_iso",
		(
			SELECT translation
			FROM fn_trans_get_by_id
			(
				p.trans_id,
				cte.lang_iso
			)
		) AS "pos_translation",
		(
			SELECT
				CASE WHEN EXISTS
				(
					SELECT
					FROM
					sense_trans_impossible
					WHERE
						sense_id = s.sense_id
						AND lang_id = cte.lang_id
				)
				THEN TRUE
				ELSE FALSE
				END
		) AS "translation_impossible",
		foreign_lemmas.lemma_title AS "sense_translation",
		(
			SELECT trans_value
			FROM indiv_translations
			WHERE
				trans_id = s.sense_def
				AND lang_id = cte.lang_id
		) AS "def_translation"
	FROM senses s
	JOIN lemmas l
		ON s.lemma_id = l.lemma_id
	JOIN parts_of_speech p
		ON s.pos_id = p.pos_id
	CROSS JOIN cte AS cte
	LEFT JOIN (
		SELECT st.sense_id, il.lang_id, il.lemma_title, il.lemma_id
		FROM sense_translations st
		NATURAL JOIN lemmas il
	) AS foreign_lemmas
		ON ( foreign_lemmas.sense_id = s.sense_id
		AND foreign_lemmas.lang_id = cte.lang_id )
	ORDER BY (4, 6, 10)
)
SELECT *
FROM my_data ;


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_lst AS
SELECT *
FROM v_lemmas_senses_translations
WITH DATA;

CREATE UNIQUE INDEX idx_u_mv_lst ON mv_lst(sense_id, translation_iso, sense_translation);

/*############################################################################*/

/* if p_clean == TRUE, then no rows with empty translation for both
 * sense and definition will be returned */

CREATE OR REPLACE FUNCTION fn_lemma_get_senses
(p_lemma_id BIGINT,
p_iso TEXT DEFAULT NULL,
p_clean BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
	"lemma_id" 			BIGINT,
	"lemma_title" 		TEXT,
	"lemma_iso" 		TEXT,
	"sense_id" 			BIGINT,
	"pos_title" 		TEXT,
	"translation_iso" 	TEXT,
	"pos_translation" 	TEXT,
	"translation_impossible" BOOLEAN,
	"sense_translation" TEXT,
	"def_translation" 	TEXT
) AS
$$ BEGIN

	RETURN QUERY
	SELECT
		*
	FROM mv_lst
	WHERE
		mv_lst.lemma_id = p_lemma_id
		AND (
			p_iso IS NULL
			OR mv_lst.translation_iso = p_iso
		) AND (
			p_clean = FALSE
			OR NOT
			(
				mv_lst.sense_translation IS NULL
				AND mv_lst.def_translation IS NULL
			)
		);



END; $$ LANGUAGE plpgsql;

/*############################################################################*/

/*  */

CREATE OR REPLACE PROCEDURE sp_lemma_mark_sense_trans_impossible
(IN p_source_id BIGINT, IN p_sense_n INT, IN p_iso TEXT) AS
$$ BEGIN

	INSERT
	INTO sense_trans_impossible
	(sense_id, lang_id)
	VALUES
	(
		(
		SELECT s.sense_id
			FROM lemmas l
			JOIN senses s
			ON s.lemma_id = l.lemma_id
			WHERE s.lemma_id = p_source_id
			ORDER BY sense_id
			OFFSET p_sense_n
			LIMIT 1
		),
		(
		SELECT lang_id
			FROM fn_lang_get_from_iso(p_iso)
		)
	);

	COMMIT;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

/* Upserts a definition, in language p_iso, to the
 * n-th sense of the lemma, where the count starts with zero */

CREATE OR REPLACE PROCEDURE sp_lemma_add_sense_def
(p_lemma_id BIGINT, p_sense_n INT, p_iso TEXT, p_def TEXT) AS
$$ DECLARE
	_trans_id BIGINT;

BEGIN

	SELECT s.sense_def
		FROM lemmas l
		JOIN senses s
		ON s.lemma_id = l.lemma_id
		WHERE s.lemma_id = p_lemma_id
		ORDER BY sense_id
		OFFSET p_sense_n
		LIMIT 1
		INTO _trans_id;

	CALL fn_trans_upsert_by_id
	(
		_trans_id,
		p_iso,
		p_def
	);

	COMMIT;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

/* Links the n-th sense of the source lemma to the destination lemma,
 * returning success value */

CREATE OR REPLACE PROCEDURE sp_lemma_add_sense_trans_by_id
(IN p_source_id BIGINT, IN p_sense_n INT, IN p_dest_id BIGINT,
INOUT o_count INT DEFAULT 0) AS
$$ BEGIN

	INSERT INTO sense_translations
		(sense_id, lemma_id)
		VALUES
		(
			(
				SELECT s.sense_id
				FROM lemmas l
				JOIN senses s
				ON s.lemma_id = l.lemma_id
				WHERE s.lemma_id = p_source_id
				ORDER BY sense_id
				OFFSET p_sense_n
				LIMIT 1
			),
			p_dest_id
		);

	GET DIAGNOSTICS o_count := ROW_COUNT ;

	COMMIT;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

/* Links the n-th sense of the source lemma to a NEW LEMMA
 * with this iso and title, returning success value.
 *
 * This should only be used if you are sure that the lemma linked
 * does not exist. If you try to use this with a lemma that already exists,
 * nothing will be inserted and 0 will be returned. */

CREATE OR REPLACE PROCEDURE sp_lemma_add_sense_trans_by_iso_title
(IN p_source_id BIGINT, IN p_sense_n INT, IN p_iso TEXT, IN p_title TEXT,
INOUT o_count INT DEFAULT 0) AS
$$ BEGIN

	IF EXISTS (
		SELECT
		FROM lemmas lm
		NATURAL JOIN languages lg
		WHERE
			lemma_title = p_title
			AND lg.lang_iso = p_iso
	) THEN
		o_count := 0;
		RETURN;
	END IF;

	CALL sp_lemma_insert(p_iso, p_title);

	INSERT INTO sense_translations
		(sense_id, lemma_id)
		VALUES
		(
			(
				SELECT s.sense_id
				FROM lemmas l
				JOIN senses s
				ON s.lemma_id = l.lemma_id
				WHERE s.lemma_id = p_source_id
				ORDER BY sense_id
				OFFSET p_sense_n
				LIMIT 1
			),
			(
				SELECT lemma_id
				FROM lemmas lm
				NATURAL JOIN languages lg
				WHERE
					lm.lemma_title = p_title
					AND lg.lang_iso = p_iso
			)
		);

	GET DIAGNOSTICS o_count := ROW_COUNT ;

	COMMIT;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE PROCEDURE sp_lemma_add_sense
(p_lemma_id BIGINT, p_pos_title TEXT) AS
$$ 
BEGIN

	INSERT INTO senses
		(lemma_id, pos_id)
		VALUES
		(
			p_lemma_id,
			(
				SELECT pos_id
					FROM parts_of_speech
					WHERE pos_title = p_pos_title
			)	
		);

	COMMIT;

END; $$ LANGUAGE plpgsql;

/*############################################################################*/

CREATE OR REPLACE FUNCTION tgfn_sense_insert()
RETURNS TRIGGER AS
$$
DECLARE
	_sense_def_id BIGINT;
BEGIN

	IF NEW.sense_def IS NULL THEN
		INSERT
			INTO translations
			DEFAULT VALUES
			RETURNING trans_id
			INTO _sense_def_id;

		NEW.sense_def := _sense_def_id;
	END IF;
	
	RETURN NEW;

END; $$ LANGUAGE plpgsql;

CREATE TRIGGER tg_sense_insert
BEFORE INSERT ON senses
FOR EACH ROW EXECUTE PROCEDURE tgfn_sense_insert();