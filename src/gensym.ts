let next = 0;
export function gensym () {
  return `__var${++next}__`;
}
