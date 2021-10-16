CMD="psql -h localhost -d vulpi -U moraesvic -w -q -f"
$CMD drop.sql
$CMD translations.sql
$CMD languages.sql
$CMD indiv-translations.sql
$CMD parts-of-speech.sql

$CMD lemmas-senses.sql

$CMD users.sql
$CMD test.sql
