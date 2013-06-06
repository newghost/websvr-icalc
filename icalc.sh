#!/bin/bash
echo "start icalc"

export WEB_PORT=8051

#change current dir, in order to call it from anywhere.
cd $(dirname $0)

while true; do
  node ./svr/icalc_svr.js

  echo "Server stop working, waiting for restart...\r\n\r\n\r\n\r\n"
  sleep 5
done