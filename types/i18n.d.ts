declare class Locale {
    altTip?: string;
    floatLeft?: string;
    floatRight?: string;
    center?: string;
    restore?: string;
}
declare class I18n {
    config: Locale;
    constructor(config: Locale);
    findLabel(key: string): string | null;
}
declare const defaultLocale: Locale;
export { I18n, Locale, defaultLocale };
