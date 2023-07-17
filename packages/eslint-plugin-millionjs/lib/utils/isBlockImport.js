function isBlockImport(node) {
  return (
    node.type === "ImportSpecifier" &&
    node.imported.name === "block" &&
    node.parent.source.value === "million/react"
  );
}

module.exports = isBlockImport;
