import {Ident} from "./data/Ident";
import * as s from './specials';
import { ArraySeq } from './data/ArraySeq';
import { ArrayVector } from './data/ArrayVector';
import { gensym } from './gensym';
import { Env } from './env';
import {show} from './data/proto';

function _compileIf(seq, env: Env): [string, string] {
  const arity = seq.count();
  if (arity > 4 || arity < 3) throw new Error('arity exception yo');
  const [testStmt, testExpr] = _compile(seq.nth(1), env);
  const [thenStmt, thenExpr] = _compile(seq.nth(2), env);
  const [elseStmt, elseExpr] = seq.count() === 4 ? _compile(seq.nth(3), env) : [null, 'null'];

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

function _compileDo(seq, env: Env): [string, string] {
  seq = seq.rest();
  let stmt = '';
  let [lastStmt, lastExpr] = [null, 'null'];
  while ((seq = seq.seq()) != null) {
    if (lastStmt !== null) {
      stmt += lastStmt;
    }
    if (lastExpr !== 'null') {
      stmt += lastExpr + ";\n";
    }
    [lastStmt, lastExpr] = _compile(seq.first(), env);
    seq = seq.rest();
  }
  if (lastStmt !== null) {
    stmt += lastStmt;
  }
  return [stmt || null, lastExpr];
}

function _compileDef(seq, env: Env): [string, string] {
  const ident = seq.nth(1);
  if (!(ident instanceof Ident)) {
    throw new Error('first argument to def should be an ident');
  } else if (ident.namespace) {
    throw new Error(`can't intern qualified ident`);
  } else if (seq.count() !== 3) {
    throw new Error(`wrong arity for def ${seq.count()}`);
  }

  env.ns.intern(ident, null);

  const resolved = env.resolve(ident);

  let [stmt, expr] = _compile(seq.nth(2), env);

  stmt = stmt || '';
  stmt = stmt + `${resolved} = ${expr};\n`;

  return [stmt, 'null']
}

function _compileIdentCallsite(seq, env: Env): [string, string] {
  const fnIdent = seq.first();
  const resolved = env.resolve(fnIdent);

  let stmt = '';
  let argExprs = [];

  seq = seq.rest().seq();

  while (seq != null) {
    let [nextStmt, nextArgExpr] = _compile(seq.first(), env);
    if (nextStmt !== null) {
      stmt += nextStmt;
    }
    argExprs.push(nextArgExpr);
    seq = seq.rest().seq();
  }

  return [stmt || null, resolved + `(${argExprs.join(', ')})`];
}

function _compileFn(seq, env: Env): [string, string] {
  seq = seq.rest().seq();

  if (seq == null) {
    throw new Error('expecting arg vector');
  }
  
  let second = seq.first();
  if (second instanceof Ident) {
    // dunno
    seq = seq.rest().seq();
    second = seq.first();
  }

  // seq should be vector for params
  // do multi-arity laters
  if (!(second instanceof ArrayVector)) {
    throw new Error('yo this should be a vector?!');
  }

  const identParams = second.array;
  const sanitizedParams = [];

  env.pushLocals();

  for (let i = 0; i < identParams.length; i++) {
    const ident = identParams[i];
    // make sure all idents
    if (!(ident instanceof Ident)) {
      throw new Error('expecting ident');
    }
    // make sure no namespace
    if (ident.namespace != null) {
      throw new Error("can't use qualified idents for function parameter names");
    }
    // make sure no duplicates
    if (identParams.indexOf(ident, i+1) !== -1) {
      throw new Error('duplicate parameter name')
    }

    sanitizedParams.push(env.locals.setBinding(ident));
  }

  // todo: function name
  const [bodyStmt, bodyExpr] = _compileDo(seq, env);

  env.popLocals();

  return [null, `function (${sanitizedParams.join(', ')}) {\n${bodyStmt}\nreturn ${bodyExpr};\n}`];
}

function _compileSeq(seq, env: Env): [string, string] {
  const count = seq.count();
  if (count === 0) return [null, env.resolve(s.LIST) + "()"];
  const first = seq.first();
  if (first instanceof Ident) {
    switch (first.intern()) {
    case s.IF: return _compileIf(seq, env);
    case s.DO: return _compileDo(seq, env);
    case s.DEF: return _compileDef(seq, env);
    case s.FN: return _compileFn(seq, env);
    case s.QUOTE:
      return [null, `__vimes_env__.read(${JSON.stringify(show(seq.nth(1)))})`];
    default: return _compileIdentCallsite(seq, env);
    }
  }
}

function _compile(form, env: Env): [string, string] {
  if (form == null) return [null, 'null'];
  if (form instanceof Ident) {
    return [null, env.resolve(form)];
  } else if (form instanceof ArraySeq) {
    return _compileSeq(form, env);
  } else {
    switch (typeof form) {
    case 'number':
    case 'boolean':
      return [null, form.toString()];
    case 'string':
      return [null, JSON.stringify(form)];
    default:
      throw new Error('type not yet supported: ' + typeof form);
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
