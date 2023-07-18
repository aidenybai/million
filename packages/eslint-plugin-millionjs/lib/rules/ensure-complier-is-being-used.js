const path = require("path");
const fs = require("fs");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when using block function from Million.js without proper compiler setup.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    function checkForConfigurationFile() {
      const configFiles = ["vite.config.js", "gatsby-config.js"];

      const projectDir = process.cwd();

      for (const configFile of configFiles) {
        const configFilePath = path.join(projectDir, configFile);
        if (fs.existsSync(configFilePath)) {
          return configFilePath;
        }
      }

      return null;
    }

    function checkCompilerSetup(filePath) {
      const configContent = fs.readFileSync(filePath, "utf8");

      // Regular expression to match the import statement
      const importRegex =
        /import\s+million\s+from\s+['"]million\/compiler['"];/g;

      // console.log(imports, commentedImports, uncommentedImports);

      return importRegex.test(configContent);
    }

    return {
      ImportSpecifier: function (node) {
        if (node.parent.source.value === "million/react") {
          const configFilePath = checkForConfigurationFile();

          if (configFilePath) {
            const compilerUsed = checkCompilerSetup(configFilePath);
            if (!compilerUsed) {
              context.report({
                node,
                message:
                  "Using block function from Million.js without proper compiler setup.",
              });
            }
          }
        }
      },
    };
  },
};
