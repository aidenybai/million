export type PackageDotJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export type PackageManager = {
  name: string
  label: string
  lockFile: string
  installCommand: string
}

export type BuildTool = {
  name: string
  label: string
  bundler: string
  configFilePath: string
  configFileContent: string
  configFileContentRSC?: string
}
