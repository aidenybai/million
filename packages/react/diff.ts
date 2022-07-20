/*! (c) AsyncBanana - MIT */
// Copied from:
// - https://github.com/AsyncBanana/microdiff/blob/master/index.ts

interface Difference {
  type: 'CREATE' | 'REMOVE' | 'CHANGE';
  path: (string | number)[];
  value?: any;
  oldValue?: any;
}
interface Options {
  cyclesFix: boolean;
}

const richTypes = { Date: true, RegExp: true, String: true, Number: true };

export default function diff(
  obj: Record<string, any> | any[],
  newObj: Record<string, any> | any[],
  options: Partial<Options> = { cyclesFix: true },
  _stack: Record<string, any>[] = [],
): Difference[] {
  const diffs: Difference[] = [];
  const isObjArray = Array.isArray(obj);

  for (const key in obj) {
    const objKey = obj[key];
    const path = isObjArray ? Number(key) : key;
    if (!(key in newObj)) {
      diffs.push({
        type: 'REMOVE',
        path: [path],
        oldValue: obj[key],
      });
      continue;
    }
    const newObjKey = newObj[key];
    const areObjects =
      typeof objKey === 'object' && typeof newObjKey === 'object';
    if (
      objKey &&
      newObjKey &&
      areObjects &&
      !richTypes[Object.getPrototypeOf(objKey).constructor.name] &&
      (!options.cyclesFix || !_stack.includes(objKey))
    ) {
      const nestedDiffs = diff(
        objKey,
        newObjKey,
        options,
        options.cyclesFix ? _stack.concat([objKey]) : [],
      );
      // eslint-disable-next-line prefer-spread
      diffs.push.apply(
        diffs,
        nestedDiffs.map((difference) => {
          difference.path.unshift(path);
          return difference;
        }),
      );
    } else if (
      objKey !== newObjKey &&
      !(
        areObjects &&
        (isNaN(objKey)
          ? String(objKey) === String(newObjKey)
          : Number(objKey) === Number(newObjKey))
      )
    ) {
      diffs.push({
        path: [path],
        type: 'CHANGE',
        value: newObjKey,
        oldValue: objKey,
      });
    }
  }

  const isNewObjArray = Array.isArray(newObj);
  for (const key in newObj) {
    if (!(key in obj)) {
      diffs.push({
        type: 'CREATE',
        path: [isNewObjArray ? Number(key) : key],
        value: newObj[key],
      });
    }
  }
  return diffs;
}
