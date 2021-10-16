#!/usr/bin/env bash

# Read credentials from password file in home directory, then login and
# run these files

CMD="psql -h localhost -d portfolio_vulpi_ideas -U username -w -q -f"
$CMD drop.sql
$CMD translations.sql
$CMD languages.sql
$CMD indiv-translations.sql
$CMD parts-of-speech.sql

$CMD lemmas-senses.sql

$CMD users.sql
$CMD test.sql
