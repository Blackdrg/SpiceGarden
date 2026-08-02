SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgrelid = 'wallets'::regclass;
