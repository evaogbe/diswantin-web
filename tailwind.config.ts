import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontSize: {
      xs: "var(--step--2)",
      sm: "var(--step--1)",
      base: "var(--step-0)",
      lg: "var(--step-1)",
      xl: "var(--step-2)",
      "2xl": "var(--step-3)",
      "3xl": "var(--step-4)",
      "4xl": "var(--step-5)",
    },
    fontFamily: {
      display: [
        "'Nunito Sans Variable'",
        "ui-sans-serif",
        "system-ui",
        "sans-serif",
      ],
      body: [
        "'Nunito Sans Variable'",
        "ui-sans-serif",
        "system-ui",
        "sans-serif",
      ],
      mono: ["ui-monospace", "monospace"],
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "primary-container": {
          DEFAULT: "hsl(var(--primary-container))",
          foreground: "hsl(var(--primary-container-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        link: "hsl(var(--link))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      spacing: {
        "4xs": "var(--space-4xs)",
        "3xs": "var(--space-3xs)",
        "2xs": "var(--space-2xs)",
        xs: "var(--space-xs)",
        sm: "var(--space-s)",
        md: "var(--space-m)",
        lg: "var(--space-l)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
        "3xl": "var(--space-3xl)",
        "4xs-3xs": "var(--space-4xs-3xs)",
        "3xs-2xs": "var(--space-3xs-2xs)",
        "2xs-xs": "var(--space-2xs-xs)",
        "xs-sm": "var(--space-xs-s)",
        "sm-md": "var(--space-s-m)",
        "md-lg": "var(--space-m-l)",
        "lg-xl": "var(--space-l-xl)",
        "xl-2xl": "var(--space-xl-2xl)",
        "2xl-3xl": "var(--space-2xl-3xl)",
        "sm-lg": "var(--space-s-l)",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    plugin((p) => {
      p.addUtilities({
        ".field-sizing-content": {
          "field-sizing": "content",
        },
      });
    }),
  ],
} satisfies Config;
