# Tastoria

## Supabase storage driver
Enabled by `PUBLIC_STORAGE_DRIVER=supabase` with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env.local`.
Schema lives in `supabase/schema.sql`: `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/schema.sql`.
Use the IPv4 session pooler URL (`aws-0-<region>.pooler.supabase.com:5432`, user `postgres.<project-ref>`): the direct `db.*` host is IPv6-only.


## Usefull links
Remove background: https://pixlr.com/remove-background/