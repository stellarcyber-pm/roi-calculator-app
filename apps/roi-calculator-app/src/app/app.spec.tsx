import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the ROI calculator', () => {
    const { getByText } = render(<App />);
    expect(getByText('Cybersecurity ROI Calculator')).toBeTruthy();
  });
});
