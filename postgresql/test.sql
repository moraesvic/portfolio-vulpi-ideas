

CALL api_lang_insert('en', 'eng');
CALL api_lang_insert('pt', 'por');
CALL api_lang_insert('de', 'deu');
CALL api_lang_insert('es', 'spa');
CALL api_lang_insert('ru', 'rus');
CALL api_lang_insert(NULL, 'grc');

CALL api_lang_upsert_trans('en', 'pt', 'inglês');
CALL api_lang_upsert_trans('en', 'en', 'English');
CALL api_lang_upsert_trans('grc', 'en', 'Ancient Greek');

CALL api_trans_upsert_by_label('translation-unavailable', 'en', 'translation unavailable');
CALL api_trans_upsert_by_label('translation-unavailable', 'pt', 'tradução indisponível');

/*
SELECT * FROM api_trans_get_by_label('translation-unavailable');
*/

CALL api_pos_insert_traditional();

CALL api_pos_upsert_trans('article', 'pt', 'artigo');
CALL api_pos_upsert_trans('article', 'grc', 'ἄρθρον');

CALL api_pos_upsert_trans('noun', 'pt', 'substantivo');
CALL api_pos_upsert_trans('verb', 'pt', 'verbo');
CALL api_pos_upsert_trans('noun', 'de', 'Nomen');

/*
SELECT * FROM languages;
SELECT * FROM parts_of_speech;
SELECT * FROM translations;
SELECT * FROM indiv_translations;

SELECT * FROM api_lang_get_trans('en');
SELECT * FROM api_lang_get_trans('en', 'en');
SELECT * FROM api_lang_get_trans('pt');
SELECT * FROM api_lang_get_trans('xx');

SELECT * FROM api_pos_get_trans();
SELECT * FROM api_pos_get_trans('pt');
SELECT * FROM api_pos_get_trans('uk');
SELECT * FROM api_trans_get_by_label('pos-article', 'en');
SELECT * FROM api_trans_get_by_label('pos-article', 'uk');
*/

CALL sp_lemma_insert('en', 'skate'); -- lemma id = 1
CALL sp_lemma_add_sense(1, 'noun');		-- sense 0
CALL sp_lemma_add_sense(1, 'verb');		-- sense 1
CALL sp_lemma_add_sense_def(1, 0, 'en', 'a wooden board with wheels on the underside, used for carrying a heavy object');
CALL sp_lemma_add_sense_def(1, 1, 'en', 'to move with a skateboard or ice-skates in a sliding fashion');
CALL sp_lemma_add_sense_trans_by_iso_title(1, 1, 'pt', 'andar de skate'); -- lemma id = 2

CALL sp_lemma_insert('pt', 'gato');  -- lemma id = 3
CALL sp_lemma_add_sense(3, 'noun'); -- sense 0
CALL sp_lemma_add_sense(3, 'noun'); -- sense 1
CALL sp_lemma_add_sense(3, 'noun'); -- sense 2


-- add ENG "cat & puss" as translations for 0th sense of POR "gato"
-----> one way of doing it
CALL sp_lemma_insert('en', 'cat');  -- lemma id = 4
CALL sp_lemma_add_sense_trans_by_id(3, 0, 4, null);
-----> another way of doing it
CALL sp_lemma_add_sense_trans_by_iso_title(3, 0, 'en', 'puss'); -- lemma id = 5
CALL sp_lemma_add_sense_trans_by_iso_title(3, 0, 'en', 'puss'); -- adds nothing

CALL sp_lemma_add_sense_def(3, 0, 'en', 'a domestic cat, a feline from Felis catus sp.');
CALL sp_lemma_add_sense_def(3, 0, 'pt', 'um gato doméstico, um felino da espécie Felis catus');

-- only translation is given, without definition
-- add ENG "cat" as translation for 1st sense of POR "gato"
CALL sp_lemma_add_sense_trans_by_iso_title(3, 1, 'en', 'femme fatale'); -- lemma id = 6
CALL sp_lemma_add_sense_def(3, 1, 'pt', 'uma pessoa de boa aparência');

-- only definition is given, with no translation
CALL sp_lemma_add_sense_def(3, 2, 'pt', 'uma ligação elétrica clandestina');
CALL sp_lemma_add_sense_def(3, 2, 'en', 'an illegal connection to the electric grid');
CALL sp_lemma_mark_sense_trans_impossible(3, 2, 'en');

-- adding more info to ENG "cat"
CALL sp_lemma_add_sense(4, 'noun'); -- sense 0
CALL sp_lemma_add_sense_def(4, 0, 'en', 'a domestic cat, a feline from Felis catus sp.');
CALL sp_lemma_add_sense_def(4, 0, 'pt', 'um gato doméstico, um felino da espécie Felis catus');
-- linking to POR "gato"
CALL sp_lemma_add_sense_trans_by_id(4, 0, 3, null);
CALL sp_lemma_add_sense_trans_by_iso_title(4, 0, 'de', 'Katze'); -- lemma id = 7
CALL sp_lemma_add_sense_trans_by_iso_title(4, 0, 'ru', 'кошка'); -- lemma id = 8
CALL sp_lemma_add_sense_trans_by_iso_title(4, 0, 'es', 'gato');  -- lemma id = 9

CALL sp_lemma_insert('en', 'bank'); -- lemma id = 10


/* ----- ----- ----- ----- */

\pset null '<null>'
\timing

-- SELECT * FROM v_lemmas_senses_translations ;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lst ;
SELECT * FROM mv_lst ;

-- all senses (translations & definitions) for 'skate', in all languages
SELECT * FROM fn_lemma_get_senses(1, NULL, TRUE);

-- all senses (translations & definitions) for 'gato', in all languages
SELECT * FROM fn_lemma_get_senses(3, NULL, TRUE);

-- all senses (translations & definitions) for 'gato', in English
SELECT * FROM fn_lemma_get_senses(3, 'en', TRUE);

-- all senses (translations & definitions) for 'cat', in all languages
SELECT * FROM fn_lemma_get_senses(4, NULL, TRUE);