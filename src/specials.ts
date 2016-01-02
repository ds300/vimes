import {ident} from './data'

const ns = "vimes.core";
const n = n => ident(ns + '/' + n);

export const IF = n('if');
export const FN = n('fn');
export const DO = n('do');
export const LOOP = n('loop*');
export const RECUR = n('recur');
export const DOT = n('.');
export const LET = n('let*');
export const TRY = n('try');
export const CATCH = n('catch');
export const QUOTE = n('quote');
export const SYNTAX_QUOTE = n('syntax-quote');
export const UNQUOTE_SPLICING = n('unquote-splicing');
export const UNQUOTE = n('unquote');
export const LAMBDA = n('lambda*');
export const REQUIRE = n('require*');
export const IN_NS = n('in-ns');


export const WITH_META = n('with-meta');
export const DERIVATION = n('derivation');
export const READ_EVAL = n('read-eval');
