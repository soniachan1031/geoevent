const defaultSchemaOptions = {
  discriminatorKey: "kind",
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

export default defaultSchemaOptions;
