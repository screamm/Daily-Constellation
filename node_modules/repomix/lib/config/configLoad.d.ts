import { type RepomixConfigCli, type RepomixConfigFile, type RepomixConfigMerged } from './configSchema.js';
export declare const loadFileConfig: (rootDir: string, argConfigPath: string | null) => Promise<RepomixConfigFile>;
export declare const mergeConfigs: (cwd: string, fileConfig: RepomixConfigFile, cliConfig: RepomixConfigCli) => RepomixConfigMerged;
//# sourceMappingURL=configLoad.d.ts.map