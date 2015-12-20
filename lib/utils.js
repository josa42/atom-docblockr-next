"use babel";

export function escape(str) {
  return str.replace('$', '\$').replace('{', '\{').replace('}', '\}');
}

export function isNumeric(val) {
  return !isNaN(val);
}
