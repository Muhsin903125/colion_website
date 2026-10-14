/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md}'],
  theme: {
    screens: { xs: '400px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: {
        // Body and heading text.
        ink: { DEFAULT: '#0B1B3F', soft: '#33415C' },
        // The logo navy. Primary buttons, links, dark bands.
        brand: { DEFAULT: '#1E3A8A', deep: '#142A63', 50: '#EEF3FF', 100: '#DCE6FF', 400: '#3B82F6', 500: '#2563EB', 600: '#1D4ED8' },
        sky: '#EEF4FF',
        surface: '#F6F8FC',
        line: '#E3E8F2',
        slate: '#475569',
        // The logo gold. Fills, rules, icons and badges only — #D5A540 on
        // white is 2.3:1, so gold *text* on white uses `gold-deep` (5.4:1).
        gold: { DEFAULT: '#D5A540', soft: '#F6EBCF', deep: '#8A6516' },
        alert: '#DC2626',
        whatsapp: '#25D366',
      },
      fontFamily: {
        display: ['"Sora Variable"', 'Sora', 'system-ui', 'sans-serif'],
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      maxWidth: { container: '1440px' },
      borderRadius: { card: '14px', media: '28px' },
      boxShadow: {
        soft: '0 20px 50px -24px rgba(30,58,138,.25)',
        lift: '0 30px 70px -30px rgba(11,27,63,.35)',
        ring: '0 0 0 1px rgba(227,232,242,1)',
      },
      transitionTimingFunction: { out: 'cubic-bezier(.2,.7,.2,1)' },
      keyframes: {
        marquee: { to: { transform: 'translateX(-50%)' } },
        'marquee-rev': { from: { transform: 'translateX(-50%)' }, to: { transform: 'translateX(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulse2: { '0%': { boxShadow: '0 0 0 0 rgba(37,211,102,.55)' }, '100%': { boxShadow: '0 0 0 18px rgba(37,211,102,0)' } },
        word: { '0%': { transform: 'translateY(100%)', opacity: '0' }, '12%,88%': { transform: 'none', opacity: '1' }, '100%': { transform: 'translateY(-100%)', opacity: '0' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-rev': 'marquee-rev 46s linear infinite',
        float: 'float 6s ease-in-out infinite',
        pulse2: 'pulse2 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
