#!/bin/bash

source $(dirname "$0")/helpers.sh

index_html_content="<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <link rel=\"stylesheet\" href=\"./style.css\">
    <script type=\"module\" src=\"./script.ts\"></script>
  </head>
  <body>
    <div id=\"app\"></div>
    <!-- Your code here -->
  </body>
</html>"
script_ts_content="import { m, patch } from '../src/index';"
style_css_content="body {
  font-size: 2em;
  display: flex;
  justify-content: center;
  align-items: start;
  padding-top: 2em;
}"

if [ "$1" == "--fresh" ]; then
  if [ -d dev ]; then
    info "Found the \`dev\` directory, deleting it now..."
    rm -rf dev
  fi
fi

if [ ! -d dev ]; then
  mkdir dev
  echo "$index_html_content" > dev/index.html
  echo "$script_ts_content" > dev/script.ts
  echo "$style_css_content" > dev/style.css
  info "Couldn't find an the \`dev\` directory, creating one for you..."
fi

vite --host
