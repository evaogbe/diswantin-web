import type { Constraint, DefaultValue, FieldName } from "@conform-to/dom";
import { useField } from "@conform-to/react";
import type { FieldMetadata, FormMetadata } from "@conform-to/react";
import { createContext, useContext } from "react";
import { Label } from "./label";
import { cn } from "~/ui/classes";

function getFormProps<FormValue extends Record<string, unknown>>(
  form: FormMetadata<FormValue>,
) {
  return {
    id: form.id,
    noValidate: form.noValidate,
    onSubmit: form.onSubmit,
    "aria-describedby": form.errors != null ? form.errorId : undefined,
  };
}

function getCollectionProps<
  FieldValue,
  FormValue extends Record<string, unknown>,
>(
  meta: FieldMetadata<FieldValue, FormValue>,
  form: FormMetadata<FormValue>,
  {
    type,
    options,
    controlled,
  }: {
    type: "checkbox" | "radio";
    options: readonly string[];
    controlled?: boolean;
  },
) {
  return options.map((option) => ({
    id: `${meta.id}-${option}`,
    type,
    name: meta.name,
    value: option,
    form: meta.formId,
    "aria-invalid": meta.errors != null,
    "aria-describedby":
      meta.errors == null
        ? meta.descriptionId
        : `${meta.descriptionId} ${meta.errorId}`,
    required: type === "checkbox" ? undefined : meta.required,
    checked: controlled
      ? Array.isArray(meta.value)
        ? meta.value.includes(option)
        : meta.value === option
      : undefined,
    defaultChecked: controlled
      ? undefined
      : Array.isArray(meta.initialValue)
        ? meta.initialValue.includes(option)
        : meta.initialValue === option,
    onChange: controlled
      ? (e: React.ChangeEvent<HTMLInputElement>) => {
          if (type === "checkbox") {
            form.update({
              name: meta.name,
              value: (e.target.checked
                ? options.filter(
                    (o) =>
                      o === option ||
                      (Array.isArray(meta.value)
                        ? meta.value.includes(o)
                        : meta.value === o),
                  )
                : options.filter(
                    (o) =>
                      o !== option &&
                      (Array.isArray(meta.value)
                        ? meta.value.includes(o)
                        : meta.value === o),
                  )) as NonNullable<DefaultValue<FieldValue>>,
            });
          } else {
            form.update({
              name: meta.name,
              value: option as NonNullable<DefaultValue<FieldValue>>,
            });
          }
        }
      : undefined,
  }));
}

type FormFieldContextValue = {
  id: string;
  descriptionId: string;
  errorId: string;
  error?: string;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const field = useContext(FormFieldContext);
  if (field == null) {
    throw new Error("useFormField should be used within <FormField>");
  }

  return field;
}

type FieldKind = "input" | "textarea" | "select" | "minimal";

type FieldRenderProps = Constraint & {
  key?: string;
  id: string;
  name: string;
  form: string;
  "aria-invalid": boolean;
  "aria-describedby": string;
};

type ControlRenderProps = {
  defaultValue?: string;
  value: string;
  onChange: React.ChangeEventHandler;
  onValueChange: (value: string) => void;
};

function getFieldContextProps(meta: FieldMetadata) {
  return {
    id: meta.id,
    descriptionId: meta.descriptionId,
    errorId: meta.errorId,
    error: meta.errors?.[0],
  };
}

function getFieldProps(kind: FieldKind, allProps: FieldRenderProps) {
  switch (kind) {
    case "input": {
      return allProps;
    }
    case "textarea": {
      const { min, max, step, pattern, multiple, ...props } = allProps;
      return props;
    }
    case "select": {
      const { minLength, maxLength, min, max, step, pattern, ...props } =
        allProps;
      return props;
    }
    case "minimal": {
      const {
        minLength,
        maxLength,
        min,
        max,
        step,
        multiple,
        pattern,
        ...props
      } = allProps;
      return props;
    }
  }
}

function FormField<FieldValue>({
  name,
  kind = "input",
  render,
}: {
  name: FieldName<FieldValue>;
  kind?: FieldKind;
  render: (props: {
    field: FieldRenderProps;
    control: ControlRenderProps;
  }) => React.ReactNode;
}) {
  const [meta, form] = useField(name);

  return (
    <FormFieldContext.Provider value={getFieldContextProps(meta)}>
      {render({
        field: getFieldProps(kind, {
          id: meta.id,
          name: meta.name,
          form: meta.formId,
          "aria-invalid": meta.errors != null,
          "aria-describedby":
            meta.errors == null
              ? meta.descriptionId
              : `${meta.descriptionId} ${meta.errorId}`,
          required: meta.required,
          minLength: meta.minLength,
          maxLength: meta.maxLength,
          min: meta.min,
          max: meta.max,
          step: meta.step,
          multiple: meta.multiple,
          pattern: meta.pattern,
        }),
        control: {
          defaultValue:
            typeof meta.initialValue === "string"
              ? meta.initialValue
              : undefined,
          value: typeof meta.value === "string" ? meta.value : "",
          onChange: (e) => {
            if ("value" in e.target && typeof e.target.value === "string") {
              form.update({
                name: meta.name,
                value: e.target.value as NonNullable<DefaultValue<FieldValue>>,
              });
            }
          },
          onValueChange: (value) => {
            form.update({
              name: meta.name,
              value: value as NonNullable<DefaultValue<FieldValue>>,
            });
          },
        },
      })}
    </FormFieldContext.Provider>
  );
}

function FormFieldSet<FieldValue>(
  props: Omit<React.JSX.IntrinsicElements["fieldset"], "name"> & {
    name: FieldName<FieldValue>;
  },
) {
  const [meta] = useField(props.name);

  return (
    <FormFieldContext.Provider value={getFieldContextProps(meta)}>
      <fieldset {...props} />
    </FormFieldContext.Provider>
  );
}

function FormLegend({
  className,
  ...props
}: React.JSX.IntrinsicElements["legend"]) {
  const field = useFormField();

  return (
    <legend
      className={cn(
        "text-sm font-medium leading-none",
        field.error != null && "text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FormItem({ className, ...props }: React.JSX.IntrinsicElements["p"]) {
  return <p className={cn("flex flex-col gap-fl-3xs", className)} {...props} />;
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const field = useFormField();

  return (
    <Label
      className={cn(field.error != null && "text-destructive", className)}
      htmlFor={field.id}
      {...props}
    />
  );
}

function FormDescription({
  className,
  ...props
}: React.JSX.IntrinsicElements["span"]) {
  const field = useFormField();

  return (
    <span
      id={field.descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.JSX.IntrinsicElements["strong"]) {
  const field = useFormField();
  const body = field.error ?? children;

  if (!body) {
    return null;
  }

  return (
    <strong
      id={field.errorId}
      role="alert"
      className={cn(
        "inline-block text-sm font-medium text-destructive",
        className,
      )}
      {...props}
    >
      {body}
    </strong>
  );
}

export {
  getFormProps,
  getCollectionProps,
  useFormField,
  FormField,
  FormFieldSet,
  FormLegend,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
};
