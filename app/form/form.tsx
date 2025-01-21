import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { toJsonSchema } from "@valibot/to-json-schema";
import type { JSONSchema7Definition } from "json-schema";
import { createContext, useContext, useId } from "react";
import { Controller } from "react-hook-form";
import type {
  ControllerProps,
  DefaultValues,
  FieldPath,
  FieldValues,
  SubmitErrorHandler,
} from "react-hook-form";
import { useHref, useSubmit } from "react-router";
import type {
  FetcherWithComponents,
  FormEncType,
  FormMethod,
} from "react-router";
import {
  RemixFormProvider,
  useRemixForm,
  useRemixFormContext,
} from "remix-hook-form";
import { useHydrated } from "remix-utils/use-hydrated";
import type * as v from "valibot";
import { Label } from "./label";
import { valibotResolver } from "./resolver";
import { cn } from "~/ui/classes";

type Constraint = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  multiple?: boolean;
  pattern?: string;
};

function getFormConstraints(schema: v.GenericSchema) {
  const constraints = new Map<string, Constraint>();
  const updateConstraints = (
    jsonSchema: JSONSchema7Definition,
    name: string,
  ) => {
    if (typeof jsonSchema === "boolean") return;

    switch (jsonSchema.type) {
      case "string": {
        const constraint = {} as Constraint;

        if (jsonSchema.minLength != null && jsonSchema.minLength > 1) {
          constraint.minLength = jsonSchema.minLength;
        }

        if (jsonSchema.maxLength != null) {
          constraint.maxLength = jsonSchema.maxLength;
        }

        if (jsonSchema.pattern != null) {
          constraint.pattern = jsonSchema.pattern;
        }

        constraints.set(name, constraint);
        break;
      }
      case "number":
      case "integer": {
        const constraint = {} as Constraint;

        if (jsonSchema.minimum != null) {
          constraint.min = jsonSchema.minimum;
        }

        if (jsonSchema.maximum != null) {
          constraint.max = jsonSchema.maximum;
        }

        if (jsonSchema.multipleOf != null) {
          constraint.step = jsonSchema.multipleOf;
        }

        constraints.set(name, constraint);
        break;
      }
      case "object": {
        for (const prop in jsonSchema.properties) {
          if (
            Object.hasOwn(jsonSchema.properties, prop) &&
            jsonSchema.properties[prop] != null
          ) {
            updateConstraints(
              jsonSchema.properties[prop],
              name ? `${name}.${prop}` : prop,
            );
          }
        }

        for (const name of jsonSchema.required ?? []) {
          const constraint = constraints.get(name) ?? {};
          constraint.required = true;
          constraints.set(name, constraint);
        }

        break;
      }
      case "array": {
        if (jsonSchema.items != null) {
          const items = Array.isArray(jsonSchema.items)
            ? jsonSchema.items
            : [jsonSchema.items];
          for (const item of items) {
            updateConstraints(item, name);
          }
        }
        const constraint = constraints.get(name) ?? {};
        constraint.multiple = true;
        constraints.set(name, constraint);
        break;
      }
    }

    for (const sub of jsonSchema.allOf ?? []) {
      updateConstraints(sub, name);
    }

    for (const sub of jsonSchema.anyOf ?? []) {
      updateConstraints(sub, name);
    }

    for (const sub of jsonSchema.oneOf ?? []) {
      updateConstraints(sub, name);
    }
  };
  const jsonSchema = toJsonSchema(schema, { errorMode: "ignore" });
  updateConstraints(jsonSchema, "");
  return constraints;
}

const FormContext = createContext(new Map<string, Constraint>());

function useForm<
  Schema extends v.GenericSchema,
  TFieldValues extends FieldValues = v.InferInput<Schema> & FieldValues,
>({
  schema,
  defaultValues,
  fetcher,
  onInvalid,
}: {
  schema: Schema;
  defaultValues: DefaultValues<TFieldValues>;
  fetcher?: FetcherWithComponents<unknown>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
}) {
  const actionSubmit = useSubmit();
  const submit = fetcher != null ? fetcher.submit : actionSubmit;
  const noValidate = useHydrated();
  const id = useId();
  const basename = useHref("/");
  const form = useRemixForm<TFieldValues>({
    resolver: valibotResolver(schema),
    defaultValues,
    fetcher,
    submitHandlers: {
      onValid: async (_, e) => {
        if (
          e?.target instanceof HTMLFormElement &&
          e.nativeEvent instanceof SubmitEvent
        ) {
          await submit(new FormData(e.target, e.nativeEvent.submitter), {
            method: e.target.method as FormMethod,
            action: e.target.action.replace(
              `${window.location.origin}${basename === "/" ? "" : basename}`,
              "",
            ),
            encType: e.target.enctype as FormEncType,
          });
        }
      },
      onInvalid,
    },
  });
  const errorId = `${id}-error`;

  return {
    ...form,
    id,
    titleId: `${id}-title`,
    errorId,
    errorHeadingId: `${errorId}-heading`,
    error: form.formState.errors.root?.message,
    noValidate,
    constraints: getFormConstraints(schema),
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      void form.handleSubmit(e);
    },
  };
}

type UseFormReturn<
  Schema extends v.GenericSchema,
  TFieldValues extends FieldValues = v.InferInput<Schema> & FieldValues,
> = ReturnType<typeof useForm<Schema, TFieldValues>>;

function FormProvider<
  Schema extends v.GenericSchema,
  TFieldValues extends FieldValues = v.InferInput<Schema> & FieldValues,
>({
  form,
  children,
}: {
  form: ReturnType<typeof useForm<Schema, TFieldValues>>;
  children: React.ReactNode;
}) {
  const {
    id,
    titleId,
    errorId,
    errorHeadingId,
    error,
    noValidate,
    constraints,
    onSubmit,
    ...ctx
  } = form;

  return (
    <FormContext.Provider value={constraints}>
      <RemixFormProvider {...ctx}>{children}</RemixFormProvider>
    </FormContext.Provider>
  );
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id: string;
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const field = useContext(FormFieldContext);
  const { getFieldState, formState } = useRemixFormContext();

  if (field == null) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const fieldState = getFieldState(field.name, formState);
  return {
    ...field,
    ...fieldState,
    descriptionId: `${field.id}-form-item-description`,
    errorId: `${field.id}-form-item-error`,
  };
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  const id = useId();

  return (
    <FormFieldContext.Provider value={{ id, name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function FormFieldSet<TFieldValues extends FieldValues = FieldValues>({
  className,
  ...props
}: Omit<React.JSX.IntrinsicElements["fieldset"], "name"> & {
  name: FieldPath<TFieldValues>;
}) {
  const id = useId();

  return (
    <FormFieldContext.Provider value={{ id, name: props.name }}>
      <fieldset className={cn("space-y-2xs", className)} {...props} />
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
  return <p className={cn("space-y-3xs", className)} {...props} />;
}

function FormLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<typeof LabelPrimitive.Root>>;
}) {
  const field = useFormField();

  return (
    <Label
      className={cn(field.error != null && "text-destructive", className)}
      htmlFor={field.id}
      {...props}
    />
  );
}

type FieldKind = "input" | "select" | "textarea";

function getFieldConstraint(kind: FieldKind, inputConstraint: Constraint) {
  switch (kind) {
    case "input":
      return inputConstraint;
    case "select": {
      const { required, multiple } = inputConstraint;
      return { required, multiple };
    }
    case "textarea": {
      const { required, minLength, maxLength } = inputConstraint;
      return { required, minLength, maxLength };
    }
  }
}

function FormControl({
  kind = "input",
  ...props
}: React.ComponentPropsWithoutRef<typeof Slot> & {
  ref?: React.RefObject<React.ComponentRef<typeof Slot>>;
  kind?: FieldKind;
}) {
  const constraints = useContext(FormContext);
  const { error, name, id, descriptionId, errorId } = useFormField();
  const constraint = getFieldConstraint(kind, constraints.get(name) ?? {});

  return (
    <Slot
      {...constraint}
      id={id}
      aria-describedby={
        error == null ? descriptionId : `${descriptionId} ${errorId}`
      }
      aria-invalid={error != null}
      {...props}
    />
  );
}

function FormDescription({
  className,
  ...props
}: React.JSX.IntrinsicElements["span"]) {
  const { descriptionId } = useFormField();

  return (
    <span
      id={descriptionId}
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
  const { error, errorId } = useFormField();
  const body = error ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <strong
      id={errorId}
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
  useForm,
  FormProvider,
  useFormField,
  FormField,
  FormFieldSet,
  FormLegend,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};

export type { UseFormReturn };
