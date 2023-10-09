const {
  defaultGenerateIdentifierType,
  defaultGetPropertyMetadata,
} = require('kanel');

console.log(process.env.DATABASE_URL);

/** @type {import('kanel').Config} */
module.exports = {
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
      '',
    );

    return result;
  },
  getPropertyMetadata(property, details, generateFor, config) {
    const metadata = defaultGetPropertyMetadata(
      property,
      details,
      generateFor,
      config,
    );

    // We automatically transform null values into undefined values at the Postgres
    // client level, so here we are converting the nullable properties into optional
    // properties, in order to have consistent types.
    if (property.isNullable) {
      metadata.nullableOverride = false;
      metadata.optionalOverride = true;
    }

    return metadata;
  },
};
