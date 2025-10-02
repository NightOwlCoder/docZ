# Documentation Repository

This repo contains documentation synced from other projects.

## Sync Script

Use `sync-docs.sh` to keep documentation in sync:

```bash
./sync-docs.sh        # pull from source (default)
./sync-docs.sh pull   # same as above  
./sync-docs.sh push   # push changes back to source
```

**Pull**: Syncs from source repo to this docs repo and commits changes automatically.

**Push**: Syncs from this docs repo back to source repo. You'll need to commit manually in the source repo.
