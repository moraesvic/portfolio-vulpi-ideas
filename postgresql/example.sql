create table if not exists translation (
	lang text,
	trans text
);

create or replace function get_translation
(p_lang text) returns table (
	lang text,
	trans text
) as
$$ declare
	_count int;
begin

	with cte as
	(
		select *
			from translation
			where lang = p_lang
	)
	select count(*)
		from cte
		into _count;

	if _count = 0 then
		return query
			select (p_lang, 'unavailable');
	end if;

	return query
		select * from cte;

end; $$ language plpgsql;