const stringifyAndParse = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export default stringifyAndParse;
