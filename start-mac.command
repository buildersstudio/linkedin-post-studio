#!/bin/bash
# LinkedIn Post Studio — double-click me to start.
#
# First time on a Mac? Because this file was downloaded from the internet,
# macOS may block a plain double-click. Right-click the file, choose "Open",
# then confirm — you only need to do that once.
#
# This starts a tiny local web server and opens the studio in your browser.
# Keep this window open while you work; close it (or press Ctrl-C) to stop.
# Nothing leaves your computer.
#
# On a brand-new Mac, macOS may offer to install its free "command line
# developer tools" the first time (they include the small web server this
# uses). Click Install, wait a minute, then double-click this file again.

cd "$(dirname "$0")"

# Pick a free high port on first run and remember it in .dev-port, so the studio
# keeps the same URL every time you start it. Low ports like 3000 and 8080 collide
# with whatever else you have running, and browsers share cookies across all ports
# on localhost, so staying up high keeps this tool out of everyone else's way.
PORT_FILE=".dev-port"

port_free() { ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

PORT=""
if [ -f "$PORT_FILE" ]; then
  REMEMBERED=$(tr -dc '0-9' < "$PORT_FILE")
  if [ -n "$REMEMBERED" ] && port_free "$REMEMBERED"; then PORT="$REMEMBERED"; fi
fi

if [ -z "$PORT" ]; then
  # $RANDOM is 0-32767, so this lands between 20000 and 52767.
  for _ in $(seq 1 50); do
    CANDIDATE=$(( 20000 + RANDOM ))
    if port_free "$CANDIDATE"; then PORT="$CANDIDATE"; break; fi
  done
  if [ -z "$PORT" ]; then
    echo "  Could not find a free port. Close some apps and try again."
    exit 1
  fi
  echo "$PORT" > "$PORT_FILE"
fi

echo
echo "  LinkedIn Post Studio is running at:  http://localhost:$PORT"
echo "  Keep this window open while you use it. Press Ctrl-C to stop."
echo

( sleep 1; open "http://localhost:$PORT" ) &
exec python3 -m http.server --bind 127.0.0.1 "$PORT"
