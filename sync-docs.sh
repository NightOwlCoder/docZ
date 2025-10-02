#!/bin/bash

# Add folders here
FOLDERS=(
  "/Users/sibagy/fileZ/ai/weblab-mcp/docs/weblab-mcp"
  "/Users/sibagy/fileZ/ai/weblab-mcp/docs/threads"
)

sync_folder() {
  local source_path="$1"
  local dest_name=$(basename "$source_path")
  local dest_dir="./$dest_name"
  
  if [ "$2" = "push" ]; then
    echo "  $dest_name -> source"
    rsync -av --delete "$dest_dir/" "$source_path/"
  else
    echo "  source -> $dest_name"
    rsync -av --delete "$source_path/" "$dest_dir/"
  fi
}

case "$1" in
  "pull"|"")
    echo "Pulling latest from git..."
    git pull
    echo "Syncing FROM source TO docs repo..."
    for folder in "${FOLDERS[@]}"; do
      sync_folder "$folder"
    done
    git add .
    if ! git diff --cached --quiet; then
      git commit -m "Sync docs $(date +%Y-%m-%d)"
      git push
      echo "Changes committed and pushed"
    else
      echo "No changes to commit"
    fi
    ;;
  "push")
    echo "Pulling latest from git..."
    git pull
    echo "Syncing FROM docs repo TO source..."
    for folder in "${FOLDERS[@]}"; do
      sync_folder "$folder" push
    done
    echo "Changes pushed to source. Don't forget to commit in the source repo!"
    ;;
  *)
    echo "Usage: $0 [pull|push]"
    echo "  pull (default): sync from source to docs repo"
    echo "  push: sync from docs repo back to source"
    exit 1
    ;;
esac
