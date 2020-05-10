/* eslint-disable no-undef */
module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ];
  return {
    presets,
  };
};
