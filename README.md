# Tastoria

## Storage drivers
Data and files switch independently, both need `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` when set to `supabase`:
- `DATA_DRIVER=firebase|supabase` (server-only, default `firebase`) — recipes;
- `PUBLIC_FILES_DRIVER=firebase|supabase` (build-time, default `supabase`) — recipe images, bucket `recipe-images`.

Schema lives in `supabase/schema.sql`: `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/schema.sql`.
Use the IPv4 session pooler URL (`aws-0-<region>.pooler.supabase.com:5432`, user `postgres.<project-ref>`): the direct `db.*` host is IPv6-only.


## Usefull links
Remove background: https://pixlr.com/remove-background/