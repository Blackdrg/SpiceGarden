declare function normalizeUrl(url: string, isStringValue: boolean): string;
declare function requestify(url: string, rootContext: string): any;
declare function getFilter(filter: any, resourcePath: string): (...args: any[]) => any;
declare function shouldUseImportPlugin(options: any): any;
declare function shouldUseURLPlugin(options: any): any;
declare function shouldUseModulesPlugins(options: any): boolean;
declare function shouldUseIcssPlugin(options: any): boolean;
declare function getModulesPlugins(opti