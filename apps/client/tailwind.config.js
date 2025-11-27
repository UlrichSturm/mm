/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Gold gradient classes for buttons
    'bg-gradient-to-r',
    'from-[#D4AF37]',
    'to-[#CBA135]',
    'from-[#F5E6A8]',
    'via-[#D4AF37]',
    'to-[#B8941F]',
    'from-[#B8941F]',
    'to-[#CBA135]',
    'from-[#CBA135]',
    'to-[#D4AF37]',
    'from-[#8B6F1A]',
    'bg-gradient-to-br',
    'bg-gradient-to-bl',
    'bg-gradient-to-tr',
    'hover:from-[#CBA135]',
    'hover:to-[#F5E6A8]',
    'hover:via-[#F5E6A8]',
    'hover:to-[#CBA135]',
    'hover:from-[#D4AF37]',
    'hover:via-[#D4AF37]',
    'hover:to-[#F5E6A8]',
    'hover:from-[#F5E6A8]',
    'hover:via-[#D4AF37]',
    'hover:to-[#D4AF37]',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        golden: {
          main: "#D4AF37",
          light: "#F5E6A8",
          dark: "#B8941F",
          darker: "#8B6F1A",
          olive: "#6E715F",
          ivory: "#FAF6F0",
          cream: "#EDE8DA",
        },
        iso26: {
          white: "#FFFFFF",
          cream: "#F5F2E9",
          ivory: "#EDE8DA",
          olive: "#6E715F",
          dark: "#2C2C2C",
          goldMatte: "#A68D5D",
          gold: "#D4AF37",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(to right, #D4AF37, #CBA135)',
        'gradient-gold-hover': 'linear-gradient(to right, #CBA135, #F5E6A8)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

