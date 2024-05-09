/**
 * Transformer function for orval.
 *
 * @param {OpenAPIObject} schema
 * @return {OpenAPIObject}
 */
module.exports = (inputSchema) => ({
  ...inputSchema,
  paths: Object.entries(inputSchema.paths).reduce(
    (acc, [path, pathItem]) => ({
      ...acc,
      [`v{version}${path}`]: Object.entries(pathItem).reduce(
        (pathItemAcc) => ({
          ...pathItemAcc,
          [pathItemAcc.verb]: {
            ...pathItemAcc.operation,
            parameters: [
              ...(pathItemAcc.operation?.parameters || []),
              {
                name: 'version',
                in: 'path',
                required: true,
                schema: {
                  type: 'number',
                  default: 1,
                },
              },
            ],
          },
        }),
        {},
      ),
    }),
    {},
  ),
});