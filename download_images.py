#!/usr/bin/env python3
"""Download Pragmatic Play game images from external URLs to local storage."""

import json
import os
import re
import requests
from urllib.parse import urlparse
from pathlib import Path

# Paths
GAMES_JSON = "public/providers/Pragmatic Play/games.json"
OUTPUT_DIR = "public/providers/Pragmatic Play"
TS_FILE = "data/pragmatic_play_games.ts"

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Statistics
downloaded = 0
already_exists = 0
failed = 0
failed_games = []

def sanitize_filename(title: str) -> str:
    """Create a safe filename from game title."""
    # Replace special chars and spaces with underscores
    safe = re.sub(r'[^\w\s-]', '', title)
    safe = re.sub(r'\s+', '_', safe)
    safe = re.sub(r'_+', '_', safe)
    safe = safe.strip('_')
    # Limit to 50 chars
    if len(safe) > 50:
        safe = safe[:50].rstrip('_')
    return safe + '.jpg'

def download_image(url: str, filepath: str) -> bool:
    """Download image from URL with timeout and error handling."""
    try:
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  Error downloading: {e}")
        return False

# Load games
print(f"Loading games from {GAMES_JSON}...")
with open(GAMES_JSON, 'r') as f:
    games = json.load(f)

print(f"Total games: {len(games)}")

# Process each game
updated_games = []

for game in games:
    title = game['title']
    image_url = game['image']
    
    # Determine local filename
    filename = sanitize_filename(title)
    local_path = os.path.join(OUTPUT_DIR, filename)
    
    # Check if already exists
    if os.path.exists(local_path):
        print(f"[EXISTS] {title}")
        already_exists += 1
    else:
        print(f"[DOWNLOADING] {title}")
        print(f"  URL: {image_url}")
        print(f"  Saving to: {local_path}")
        
        if download_image(image_url, local_path):
            print(f"  SUCCESS")
            downloaded += 1
        else:
            print(f"  FAILED")
            failed += 1
            failed_games.append(title)
    
    # Update the game entry with local path
    relative_path = f"/providers/Pragmatic Play/{filename}"
    updated_games.append({
        "title": title,
        "image": relative_path
    })

# Generate TypeScript content
ts_content = """// Auto-generated from public/providers/Pragmatic Play/games.json
// This data is embedded at build time to avoid SPA fallback issues

export interface GameEntry { title: string; image: string };

export const PRAGMATIC_PLAY_GAMES: GameEntry[] = """

ts_content += json.dumps(updated_games, indent=2) + ";\n"

# Write TypeScript file
with open(TS_FILE, 'w') as f:
    f.write(ts_content)

print("\n" + "="*50)
print("DOWNLOAD SUMMARY")
print("="*50)
print(f"Total games: {len(games)}")
print(f"Downloaded: {downloaded}")
print(f"Already existed: {already_exists}")
print(f"Failed: {failed}")

if failed_games:
    print("\nFailed downloads:")
    for game in failed_games:
        print(f"  - {game}")

print(f"\nUpdated {TS_FILE} with local paths for {len(updated_games)} games.")
