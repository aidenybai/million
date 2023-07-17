function checkImports(code) {
  // Regular expression to match import statements (with or without comments)
  const importRegex =
    /(\/\/.*$)|(^|\n)(\s*\/\*[\s\S]*?\*\/\s*)?(import\s+[\s\S]+?)(?=\n|;|$)/gm;

  const imports = [];
  const commentedImports = [];
  const uncommentedImports = [];

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const [singleLineComment, multilineComment, importStatement] = match;
    const isCommented = singleLineComment || multilineComment;

    imports.push(importStatement);
    if (isCommented) {
      commentedImports.push(importStatement);
    } else {
      uncommentedImports.push(importStatement);
    }
  }

  return { imports, commentedImports, uncommentedImports };
}

module.exports = checkImports;
