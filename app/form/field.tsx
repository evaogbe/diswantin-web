import type { Constraint, FieldName, FormValue } from "@conform-to/dom";
import type { FieldMetadata } from "@conform-to/react";
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
    "aria-errormessage": string | undefined;
    "aria-invalid": boolean;
  } & Constraint;
  data: {
    initialValue: FormValue<Schema>;
    value: FormValue<Schema>;
  };
};

function FormField<
  Schema = unknown,
  FormSchema extends Record<string, unknown> = Record<string, unknown>,
>({
  field,
  render,
}: {
  field: FieldMetadata<Schema, FormSchema>;
  render: (renderProps: RenderProps<Schema>) => React.ReactNode;
}) {
  return (
    <FormFieldContext.Provider value={field}>
      {render({
        field: {
          id: field.id,
          name: field.name,
          "aria-describedby": field.descriptionId,
          "aria-errormessage": field.errors != null ? field.errorId : undefined,
          "aria-invalid": field.errors != null,
          required: field.required,
          minLength: field.minLength,
          maxLength: field.maxLength,
          min: field.min,
          max: field.max,
          step: field.step,
          multiple: field.multiple,
          pattern: field.pattern,
        },
        data: {
          initialValue: field.initialValue,
          value: field.value,
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
