import * as t from '@babel/types';

export const dedupeObjectProperties = (properties: t.ObjectProperty[]) => {
  const seen = new Set<string>();
  for (let i = properties.length - 1; i >= 0; i--) {
    if (!properties[i]) {
      properties.splice(i, 1);
      continue;
    }
    const prop = properties[i]!;
    if (
      t.isObjectProperty(prop) &&
      t.isIdentifier(prop.key) &&
      seen.has(prop.key.name)
    ) {
      properties.splice(i, 1);
    }
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      seen.add(prop.key.name);
    }
  }
  return properties;
};
