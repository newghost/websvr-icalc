#!/bin/bash
#display commands
set -x

#combiner required, intall:sudo npm install web-combiner -g
inliner    ./web/icalc.html         ./mob/icalc.min.html
gzip   -vc ./mob/icalc.min.html  >  ./mob/icalc.html

sleep 30