interface PackageManager {
  name: string;
  version: string;
}

const pmFromUserAgent = (userAgent: string): PackageManager | undefined => {
  const pmSpec = userAgent.split(' ')[0];
  if (!pmSpec) return undefined;
  const separatorPos = pmSpec.lastIndexOf('/');
  const name = pmSpec.substring(0, separatorPos);
  return {
    name: name === 'npminstall' ? 'cnpm' : name,
    version: pmSpec.substring(separatorPos + 1),
  };
};

export const detectPackageManager = (): PackageManager | undefined => {
  if (!process.env.npm_config_user_agent) {
    return undefined;
  }
  return pmFromUserAgent(process.env.npm_config_user_agent);
};
