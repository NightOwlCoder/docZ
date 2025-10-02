#!/bin/bash

SOURCE_DIR="/Users/sibagy/fileZ/ai/weblab-mcp/docs/weblab-mcp"
DEST_DIR="./weblab-mcp"

case "$1" in
  "pull"|"")
    echo "Syncing FROM source TO docs repo..."
    rsync -av --delete "$SOURCE_DIR/" "$DEST_DIR/"
    git add weblab-mcp
    if ! git diff --cached --quiet; then
      git commit -m "Sync weblab-mcp docs $(date +%Y-%m-%d)"
      echo "Changes committed"
    else
      echo "No changes to commit"
    fi
    ;;
  "push")
    echo "Syncing FROM docs repo TO source..."
    rsync -av --delete "$DEST_DIR/" "$SOURCE_DIR/"
    echo "Changes pushed to source. Don't forget to commit in the source repo!"
    ;;
  *)
    echo "Usage: $0 [pull|push]"
    echo "  pull (default): sync from source to docs repo"
    echo "  push: sync from docs repo back to source"
    exit 1
    ;;
esac
