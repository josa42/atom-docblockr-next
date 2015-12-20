"use babel";

export function escape(str) {
  return str.replace('$', '\$').replace('{', '\{').replace('}', '\}');
}
