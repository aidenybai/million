export interface PackageDotJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface PackageManager {
  name: string;
  label: string;
  lockFile: string;
  installCommand: string;
}

export interface BuildTool {
  name: string;
  label: string;
  bundler: string;
  configFilePath: string;
  possibleFileNames: string[];
  configFileContent: string;
  configFileContentRSC?: string;
}
