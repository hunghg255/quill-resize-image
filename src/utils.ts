function format(str: string, ...values): string {
  return str.replace(/\{(\d+)\}/g, function(match, index) {
    if (values.length > index) {
      return values[index];
    } else {
      return "";
    }
  });
}
export { format };
