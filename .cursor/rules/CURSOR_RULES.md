Every schema change must follow this pipeline:

1. Create a new numbered Supabase migration.

2. Never modify an already applied migration.

3. Build must pass.

4. Runtime must pass.

5. The feature is not considered complete until the new table/column can be queried from Supabase.

Forbidden:

- Editing old migrations.

- Assuming a migration has executed.

- Referencing tables that do not exist.

After every migration, verify:

SELECT * FROM <new_table> LIMIT 1;

Only after that continue implementing application code.