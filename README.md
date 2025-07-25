# Cybersecurity ROI Calculator

A modern React TypeScript application built with NX that helps cybersecurity companies demonstrate the return on investment (ROI) of their Autonomous SOC (Agentic AI) platform compared to traditional human SOC operations.

## Features

- **Comprehensive Cost Comparison**: Compare the total cost of ownership between Autonomous SOC and Human SOC
- **Real-time Calculations**: Dynamic ROI calculations that update as you adjust parameters
- **Professional UI**: Modern, responsive design with gradient backgrounds and card-based layout
- **Detailed Analysis**: Shows annual costs, savings, ROI percentage, payback period, and efficiency improvements
- **Customizable Inputs**: Adjust company size, team composition, incident metrics, and costs
- **Benefits Showcase**: Highlights key advantages of Autonomous SOC solutions
- **Interactive Pie Charts**: Visual representation of value distribution
- **Comprehensive Value Analysis**: Detailed breakdown of all value drivers beyond direct cost savings

## Key Metrics Calculated

- **Annual Costs**: Human SOC vs Autonomous SOC total costs
- **Annual Savings**: Cost reduction achieved with Autonomous SOC
- **ROI Percentage**: Return on investment calculation
- **Payback Period**: Time to recover initial investment
- **Efficiency Improvements**: Operational efficiency gains
- **Incident Response Improvements**: Faster threat response times
- **Value Creation Analysis**: Detailed breakdown of value created from:
  - False positive reduction and analyst burnout prevention
  - Risk reduction through faster incident response
  - Productivity improvements from automation
  - Analyst retention and reduced turnover
  - Compliance efficiency gains
  - Enhanced threat intelligence
  - Stress reduction and improved decision making
  - 24/7 coverage without shift premiums

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: NX with Vite
- **Styling**: SCSS Modules
- **Testing**: Jest + Cypress
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:4200`

### Building

Build the application for production:
```bash
npm run build
```

### Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run e2e
```

## Usage

1. **Company Information**: Set your company size, employee count, and security metrics
2. **Human SOC Team**: Configure your current or planned human SOC team composition
3. **Autonomous SOC Costs**: Enter your Autonomous SOC platform costs
4. **Additional Costs**: Include tooling, training, and infrastructure costs
5. **View Results**: See real-time calculations of savings, ROI, and benefits

## Default Assumptions

The calculator uses industry-standard assumptions for:
- **Salaries**: SOC Analyst ($85k), Manager ($120k), Engineer ($110k), Director ($150k)
- **Efficiency**: 75% improvement with Autonomous SOC
- **Response Time**: 85% faster incident response
- **False Positives**: Significant reduction in false positive rates

## Customization

You can easily customize the calculator by:
- Adjusting salary assumptions in the `calculateROI` function
- Modifying efficiency improvement percentages
- Adding new cost categories
- Updating the UI styling in the SCSS modules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
