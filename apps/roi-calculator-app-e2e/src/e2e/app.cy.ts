import { getGreeting } from '../support/app.po';

describe('@org/roi-calculator-app-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display app title', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains(/Autonomous SOC ROI Calculator/);
  });
});
