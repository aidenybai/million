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
helpers_ts_content="import { m, style, className } from '../src/index';
import { VNode, Props, VNodeChildren } from '../src/m';
const elements: Record<string, (props?: Props, children?: VNodeChildren) => VNode> = {};
const names = JSON.parse(
  '[\"a\", \"abbr\", \"acronym\", \"address\", \"applet\", \"area\", \"article\", \"aside\", \"audio\", \"b\", \"base\", \"basefont\", \"bdi\", \"bdo\", \"bgsound\", \"big\", \"blink\", \"blockquote\", \"body\", \"br\", \"button\", \"canvas\", \"caption\", \"center\", \"cite\", \"code\", \"col\", \"colgroup\", \"command\", \"content\", \"data\", \"datalist\", \"dd\", \"del\", \"details\", \"dfn\", \"dialog\", \"dir\", \"div\", \"dl\", \"dt\", \"element\", \"em\", \"embed\", \"fieldset\", \"figcaption\", \"figure\", \"font\", \"footer\", \"form\", \"frame\", \"frameset\", \"h1\", \"h2\", \"h3\", \"h4\", \"h5\", \"h6\", \"head\", \"header\", \"hgroup\", \"hr\", \"html\", \"i\", \"iframe\", \"image\", \"img\", \"input\", \"ins\", \"isindex\", \"kbd\", \"keygen\", \"label\", \"legend\", \"li\", \"link\", \"listing\", \"main\", \"map\", \"mark\", \"marquee\", \"math\", \"menu\", \"menuitem\", \"meta\", \"meter\", \"multicol\", \"nav\", \"nextid\", \"nobr\", \"noembed\", \"noframes\", \"noscript\", \"object\", \"ol\", \"optgroup\", \"option\", \"output\", \"p\", \"param\", \"picture\", \"plaintext\", \"pre\", \"progress\", \"q\", \"rb\", \"rbc\", \"rp\", \"rt\", \"rtc\", \"ruby\", \"s\", \"samp\", \"script\", \"section\", \"select\", \"shadow\", \"slot\", \"small\", \"source\", \"spacer\", \"span\", \"strike\", \"strong\", \"style\", \"sub\", \"summary\", \"sup\", \"svg\", \"table\", \"tbody\", \"td\", \"template\", \"text\", \"textarea\", \"tfoot\", \"th\", \"thead\", \"time\", \"title\", \"tr\", \"track\", \"tt\", \"u\", \"ul\", \"var\", \"video\", \"wbr\", \"xmp\"]',
);
names.forEach((name: string) => {
  elements[name] = (props?: Props, children?: VNodeChildren): VNode => {
    if (props && 'style' in props) {
      props.style = style(props.style as unknown as Record<string, string>);
    }

    if (props && 'class' in props) {
      delete props.class;
      props.className = className(props.class as unknown as Record<string, boolean>);
    }

    return m(name, props, children);
  };
});

export default elements;"
script_ts_content="import { patch, _ } from '../src/index';
import helpers from './helpers';
const { div } = helpers;"
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
  echo "$helpers_ts_content" > dev/helpers.ts
  echo "$style_css_content" > dev/style.css
  info "Couldn't find an the \`dev\` directory, creating one for you..."
fi

vite --host
