import { valibotResolver as baseValibotResolver } from "@hookform/resolvers/valibot";
import type { Resolver } from "@hookform/resolvers/valibot";
import type { FieldValues } from "react-hook-form";

function coerce<TFieldValues extends FieldValues>(values: TFieldValues) {
  const data = {} as TFieldValues;
  for (const name in values) {
    if (Object.hasOwn(values, name)) {
      const value = values[name];
      if (typeof value === "string" && value !== "") {
        data[name] = value;
      } else if (typeof value === "object") {
        const coerced = coerce(value);
        if (Object.keys(coerced).length > 0) {
          data[name] = coerced;
        }
      }
    }
  }
  return data;
}

export const valibotResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  (values, ...args) => {
    return baseValibotResolver(
      schema,
      schemaOptions,
      resolverOptions,
    )(coerce(values), ...args);
  };
