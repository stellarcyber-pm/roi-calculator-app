import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'npx nx run @stellarcyber/roi-calculator-app:dev',
        production: 'npx nx run @stellarcyber/roi-calculator-app:preview',
      },
      ciWebServerCommand: 'npx nx run @stellarcyber/roi-calculator-app:preview',
      ciBaseUrl: 'http://localhost:4300',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
