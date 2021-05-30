import { h } from './h';
import { createElement, patch } from './patch';

export { h, createElement, patch };

import * as rust from '../million/pkg';

rust.greet('world');
