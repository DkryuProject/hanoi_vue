export function currency(value) {
  if (!value) return "0";
  return value.toFixed(2).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,");
}

export function YMDFormatter(value) {
  if (!value) return "";
  value = value.replace(/\s/gi, "");
  return value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}
