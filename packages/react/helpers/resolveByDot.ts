function resolveByDot(path: any, obj: any) {
  let value = path.split(".").reduce(function (prev: any, curr: any) {
    return prev ? prev[curr] : null;
  }, obj);

  return value !== null && value !== undefined ? value : undefined;
}

export default resolveByDot;
