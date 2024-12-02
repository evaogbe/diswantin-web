import type { Constraint, DefaultValue, FormValue } from "@conform-to/dom";
import { useField } from "@conform-to/react";
import type { FieldMetadata, FieldName } from "@conform-to/react";
import type * as LabelPrimitive from "@radix-ui/react-label";
import { createContext, forwardRef, useContext } from "react";
import { Label } from "./label";
import { cn } from "~/ui/classes";

type FormFieldContextValue<
  Schema = unknown,
  FormSchema extends Record<string, unknown> = Record<string, unknown>,
> = FieldMetadata<Schema, FormSchema>;

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

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
  render,
}: {
  name: FieldName<Schema, FormSchema>;
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
          minLength: meta.minLength,
          maxLength: meta.maxLength,
          min: meta.min,
          max: meta.max,
          step: meta.step,
          multiple: meta.multiple,
          pattern: meta.pattern,
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

function useFormField() {
  const field = useContext(FormFieldContext);
  if (field == null) {
    throw new Error("useFormField should be used within <FormField>");
  }
  return field;
}

const FormItem = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn("space-y-2xs", className)} {...props} />;
});
FormItem.displayName = "FormItem";

const FormLabel = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const field = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(field.errors != null && "text-destructive", className)}
      htmlFor={field.id}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormDescription = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { descriptionId } = useFormField();

  return (
    <span
      ref={ref}
      id={descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => {
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
  },
);
FormMessage.displayName = "FormMessage";

export {
  FormField,
  useFormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
};
