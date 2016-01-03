import {Ident} from "./data/Ident";
import * as s from './specials';
import { ArraySeq } from './data/ArraySeq';
import { gensym } from './gensym'
import { Env } from './env'
import {show} from './data/proto'

function _compileSeq(seq, env: Env): [string, string] {
  const count = seq.count();
  if (count === 0) return [null, env.resolve(s.LIST) + "()"];

}

function _compile(form, env: Env): [string, string] {
  if (form == null) return [null, 'null'];
  if (form instanceof Ident) {
    if (form.namespace === null) {
      const local = env.locals.get(form);
    }
  } else if (form instanceof ArraySeq) {
    switch (form.first()) {
    case s.IF: {
      const arity = form.count();
      if (arity > 4 || arity < 3) throw new Error('arity exception yo');
      const [testStmt, testExpr] = _compile(form.nth(1), env);
      const [thenStmt, thenExpr] = _compile(form.nth(2), env);
      const [elseStmt, elseExpr] = form.count() === 4 ? _compile(form.nth(3), env) : [null, 'null'];

      let stmt = testStmt;

      if (thenStmt === null && elseStmt === null) {
        return [null, `__vimes_env__.bool(${testExpr}) ? ${thenExpr} : ${elseExpr}`];
      } else {
        const resultID = gensym();
        stmt += `var ${resultID};\n`;
        stmt += `if (__vimes_env__.bool(${testExpr})) {\n`;
        if (thenStmt) {
          stmt += thenStmt;
        }
        stmt += `${resultID} = ${thenExpr};\n`;
        stmt += `}\n`;
        if (elseExpr !== 'null') {
          stmt += `else {\n`;
          if (elseStmt) {
            stmt += elseStmt;
          }
          stmt += `${resultID} = ${elseExpr};\n`;
          stmt += `}\n`;
        }
        return [stmt, resultID];
      }
    }
    case s.DO: {
      form = form.rest();
      let stmt = '';
      let [lastStmt, lastExpr] = [null, 'null'];
      while ((form = form.seq()) != null) {
        if (lastExpr !== 'null') {
          if (lastStmt !== null) {
            stmt += lastStmt;
          }
          stmt += lastExpr + ";\n";
        }
        [lastStmt, lastExpr] = _compile(form.first(), env);
        form = form.rest();
      }
      if (lastStmt !== null) {
        stmt += lastStmt;
      }
      return [stmt || null, lastExpr]
    }
    case s.QUOTE:
      return [null, `__vimes_env__.read(${JSON.stringify(show(form.nth(1)))})`];
    }
  } else {
    switch (typeof form) {
    case 'number':
    case 'boolean':
      return [null, form.toString()];
    case 'string':
      return [null, JSON.stringify(form)];
    default:
      throw new Error('type not yet supported: ' + typeof form + JSON.stringify(form));
    }
  }
}

export function compile(env: Env, form:any): [string, string] {
  return _compile(form, env);
}

export function evaluate(__vimes_env__: Env, code: [string, string]): any {
  if (code[0]) eval(code[0]);
  if (code[1]) return eval(`(${code[1]})`);
}
