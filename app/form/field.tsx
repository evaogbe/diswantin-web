import type { Constraint, DefaultValue, FormValue } from "@conform-to/dom";
import { useField } from "@conform-to/react";
import type { FieldMetadata, FieldName } from "@conform-to/react";
import type * as LabelPrimitive from "@radix-ui/react-label";
import { createContext, useContext } from "react";
import { Label } from "./label";
import { cn } from "~/ui/classes";

type FormFieldContextValue<
  Schema = unknown,
  FormSchema extends Record<string, unknown> = Record<string, unknown>,
> = FieldMetadata<Schema, FormSchema>;

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const field = useContext(FormFieldContext);
  if (field == null) {
    throw new Error("useFormField should be used within <FormField>");
  }
  return field;
}

type FieldType = "input" | "select" | "textarea";

type RenderProps<
  Schema,
  FormSchema extends Record<string, unknown> = Record<string, unknown>,
> = {
  field: {
    id: string;
    name: FieldName<Schema, FormSchema>;
    "aria-describedby": string;
    "aria-invalid": boolean;
  } & Constraint;
  control: {
    initialValue: FormValue<Schema>;
    value: FormValue<Schema>;
    onChange: React.ChangeEventHandler;
  };
};

function FormField<
  Schema,
  FormSchema extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  type = "input",
  render,
}: {
  name: FieldName<Schema, FormSchema>;
  type?: FieldType;
  render: (renderProps: RenderProps<Schema>) => React.ReactNode;
}) {
  const [meta, form] = useField(name);

  return (
    <FormFieldContext.Provider value={meta}>
      {render({
        field: {
          id: meta.id,
          name: meta.name,
          "aria-describedby":
            meta.errors == null
              ? meta.descriptionId
              : `${meta.descriptionId} ${meta.errorId}`,
          "aria-invalid": meta.errors != null,
          required: meta.required,
          minLength:
            type === "input" || type === "textarea"
              ? meta.minLength
              : undefined,
          maxLength:
            type === "input" || type === "textarea"
              ? meta.maxLength
              : undefined,
          multiple:
            type === "input" || type === "select" ? meta.multiple : undefined,
          min: type === "input" ? meta.min : undefined,
          max: type === "input" ? meta.max : undefined,
          step: type === "input" ? meta.step : undefined,
          pattern: type === "input" ? meta.pattern : undefined,
        },
        control: {
          initialValue: meta.initialValue,
          value: meta.value,
          onChange: (e) => {
            if ("value" in e.target) {
              form.update({
                name: meta.name,
                value: e.target.value as NonNullable<DefaultValue<Schema>>,
              });
            }
          },
        },
      })}
    </FormFieldContext.Provider>
  );
}

function FormFieldSet<
  Schema,
  FormSchema extends Record<string, unknown> = Record<string, unknown>,
>({
  ref,
  className,
  ...props
}: Omit<React.JSX.IntrinsicElements["fieldset"], "name"> & {
  name: FieldName<Schema, FormSchema>;
}) {
  const [meta] = useField(props.name);

  return (
    <FormFieldContext.Provider value={meta}>
      <fieldset ref={ref} className={cn("space-y-2xs", className)} {...props} />
    </FormFieldContext.Provider>
  );
}

function FormLegend({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["legend"]) {
  const field = useFormField();

  return (
    <legend
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none",
        field.errors != null && "text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FormItem({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["p"]) {
  return <p ref={ref} className={cn("space-y-2xs", className)} {...props} />;
}

function FormLabel({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<typeof LabelPrimitive.Root>>;
}) {
  const field = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(field.errors != null && "text-destructive", className)}
      htmlFor={field.id}
      {...props}
    />
  );
}

function FormDescription({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["span"]) {
  const { descriptionId } = useFormField();

  return (
    <span
      ref={ref}
      id={descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({
  ref,
  className,
  children,
  ...props
}: React.JSX.IntrinsicElements["strong"]) {
  const { errors, errorId } = useFormField();
  const body = errors != null ? errors[0] : children;

  if (!body) {
    return null;
  }

  return (
    <strong
      ref={ref}
      id={errorId}
      role="alert"
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </strong>
  );
}

export {
  useFormField,
  FormField,
  FormFieldSet,
  FormLegend,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
};
