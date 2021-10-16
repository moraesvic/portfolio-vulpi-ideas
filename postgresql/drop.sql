/* ----- LEMMAS + SENSES ----- */

DROP VIEW IF EXISTS v_lemmas_senses_translations CASCADE;
DROP VIEW IF EXISTS v_all_translations;
DROP FUNCTION IF EXISTS fn_lemmas_senses_translations;
DROP FUNCTION IF EXISTS fn_lemma_get_senses;

DROP TRIGGER IF EXISTS tgfn_sense_insert ON senses;

DROP TABLE IF EXISTS sense_translations;
DROP TABLE IF EXISTS sense_trans_impossible;

DROP TABLE IF EXISTS senses;
DROP TABLE IF EXISTS lemmas;

/* ----- LANGUAGES + TRANSLATIONS ----- */

DROP TRIGGER IF EXISTS tg_lang_insert ON languages;

DROP FUNCTION IF EXISTS fn_lang_get_from_iso;
DROP FUNCTION IF EXISTS api_lang_get_trans;

DROP TABLE IF EXISTS indiv_translations;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS parts_of_speech;
DROP TABLE IF EXISTS translations;

/* ----- USERS ----- */

DROP FUNCTION IF EXISTS fn_user_new;
DROP FUNCTION IF EXISTS fn_user_set_priviledge;
DROP FUNCTION IF EXISTS fn_user_find_by_uname;
DROP FUNCTION IF EXISTS fn_user_find_by_credentials;
DROP FUNCTION IF EXISTS fn_user_check_if_auth;
DROP FUNCTION IF EXISTS fn_user_remove_old_tokens;
DROP FUNCTION IF EXISTS fn_user_add_token;

DROP TABLE IF EXISTS user_tokens;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS priviledge;