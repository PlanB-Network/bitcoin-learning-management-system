const {
  defaultGenerateIdentifierType,
  defaultGetPropertyMetadata,
} = require('kanel');

/** @type {import('kanel').Config} */
module.exports = {
  connection: process.env.DATABASE_URL,
  outputPath: './src/sql',
  customTypeMap: {
    'pg_catalog.numeric': 'number',
    'pg_catalog.int8': 'number',
    'pg_catalog.timestamptz': 'number',
    'pg_catalog.timestamp': 'number',
  },
  enumStyle: 'type',
  generateIdentifierType: (column, details, config) => {
    const result = defaultGenerateIdentifierType(column, details, config);

    result.typeDefinition[0] = result.typeDefinition[0].replace(
      / & \{ __brand: '(.*)' \}/,
      ''
    );

    return result;
  },
  getPropertyMetadata(property, details, generateFor, config) {
    const def = defaultGetPropertyMetadata(
      property,
      details,
      generateFor,
      config
    );

    return {
      ...def,
      nullableOverride: false,
      ...(property.isNullable && { optionalOverride: true }),
    };
  },
};
