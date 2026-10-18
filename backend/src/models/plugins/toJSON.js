export default function toJSONPlugin(schema) {
  schema.set("toJSON", {
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : doc.id;
      delete ret._id;
      delete ret.__v;
      delete ret.password_hash;
      return ret;
    },
  });

  schema.set("toObject", {
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : doc.id;
      delete ret._id;
      delete ret.__v;
      delete ret.password_hash;
      return ret;
    },
  });
}

