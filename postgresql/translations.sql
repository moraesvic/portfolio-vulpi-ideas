CREATE TABLE translations (
	trans_id 			BIGSERIAL NOT NULL PRIMARY KEY,
	trans_label			TEXT UNIQUE
);

/*############################################################################*/
/*#############################       API        #############################*/
/*############################################################################*/

CREATE OR REPLACE PROCEDURE api_trans_insert
(p_label TEXT) AS
$$ BEGIN
	INSERT
		INTO translations
			(trans_label) VALUES
			(p_label);

END; $$ LANGUAGE PLPGSQL;