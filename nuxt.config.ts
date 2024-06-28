// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@prisma/nuxt"],
  runtimeConfig: {
    public: {
      origin: process.env.ORIGIN,
    },
  },

  tailwindcss: {
    config: {
      safelist: [
        "grid-cols-1",
        "grid-cols-2",
        "grid-cols-3",
        "grid-cols-4",
        "grid-cols-5",
        "grid-rows-1",
        "grid-rows-2",
        "grid-rows-3",
        "grid-rows-4",
        "grid-rows-5",
      ],
      theme: {
        borderWidth: {
          DEFAULT: "1px",
          "0": "0",
          "1": "1px",
          "2": "2px",
          "3": "3px",
          "4": "4px",
          "6": "6px",
          "8": "8px",
        },
      },
    },
  },
});
