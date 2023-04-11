class Locale {
  altTip?: string;
  floatLeft?: string;
  floatRight?: string;
  center?: string;
  restore?: string;
  inputTip?: string;
}
class I18n {
  config: Locale;
  constructor(config: Locale) {
    this.config = { ...defaultLocale, ...config };
  }
  findLabel(key: string): string | null {
    if (this.config) {
      return Reflect.get(this.config, key);
    }
    return null;
  }
}

const defaultLocale: Locale = {
  floatLeft: "left",
  floatRight: "right",
  center: "center",
  restore: "restore",
  altTip: "Press and hold alt to lock ratio!",
  inputTip: "Press enter key to apply change!",
};
export { I18n, Locale, defaultLocale };
