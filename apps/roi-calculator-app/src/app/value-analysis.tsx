import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import { PieChart } from './pie-chart';

interface ValueMetrics {
  falsePositiveReduction: number;
  riskReduction: number;
  productivityImprovement: number;
  incidentResponseTime: number;
  analystRetention: number;
  complianceEfficiency: number;
  stressReduction: number;
  shiftCoverage: number;
}

interface ValueAnalysisProps {
  inputs: {
    falsePositiveRate: number;
    securityIncidentsPerMonth: number;
    averageIncidentResponseTime: number;
    humanSOCAnalysts: number;
    employeeCount: number;
  };
  results: {
    annualSavings: number;
    humanSOCTotalCost: number;
    autonomousSOCTotalCost: number;
  };
}

export const ValueAnalysis: React.FC<ValueAnalysisProps> = ({ inputs, results }) => {
  const calculateValueMetrics = (): ValueMetrics => {
    const baseAnalystSalary = 85000;
    const analystHoursPerYear = 2080; // 40 hours/week * 52 weeks
    const analystHourlyRate = baseAnalystSalary / analystHoursPerYear;

    // False Positive Reduction Value
    const currentFalsePositives = inputs.securityIncidentsPerMonth * (inputs.falsePositiveRate / 100) * 12;
    const reducedFalsePositives = inputs.securityIncidentsPerMonth * 0.05 * 12; // 5% with Autonomous SOC
    const falsePositiveReduction = (currentFalsePositives - reducedFalsePositives) * 2 * analystHourlyRate; // 2 hours per false positive

    // Risk Reduction Value (based on faster response time and better detection)
    const riskReductionPerIncident = 5000; // Average cost of incident escalation
    // Calculate actual genuine incidents (excluding false positives)
    const genuineIncidentsPerMonth = inputs.securityIncidentsPerMonth * (1 - inputs.falsePositiveRate / 100);
    const riskReduction = genuineIncidentsPerMonth * 12 * riskReductionPerIncident * 0.3; // 30% risk reduction

    // Productivity Improvement (analysts focus on high-value tasks)
    const productivityHoursSaved = inputs.humanSOCAnalysts * analystHoursPerYear * 0.4; // 40% time saved
    const productivityImprovement = productivityHoursSaved * analystHourlyRate * 1.5; // 1.5x multiplier for high-value work

    // Incident Response Time Value
    const truePositivesPerMonth = inputs.securityIncidentsPerMonth * (1 - inputs.falsePositiveRate / 100);
    const falsePositivesPerMonth = inputs.securityIncidentsPerMonth * (inputs.falsePositiveRate / 100);

    // 85% savings on true positive incident response time
    const truePositiveTimeSavings = truePositivesPerMonth * 12 * inputs.averageIncidentResponseTime * 0.85 * analystHourlyRate;

    // 10% savings on false positive investigation time (assuming 1 hour per false positive)
    const falsePositiveInvestigationTime = 1; // 1 hour to investigate false positive
    const falsePositiveTimeSavings = falsePositivesPerMonth * 12 * falsePositiveInvestigationTime * 0.1 * analystHourlyRate;

    const incidentResponseTime = truePositiveTimeSavings + falsePositiveTimeSavings;

    // Analyst Retention Value (reduced burnout)
    const turnoverCost = baseAnalystSalary * 0.5; // 50% of salary for replacement
    const analystRetention = inputs.humanSOCAnalysts * turnoverCost * 0.6; // 60% reduction in turnover

    // Compliance Efficiency Value
    const complianceHoursPerYear = inputs.humanSOCAnalysts * 200; // 200 hours per analyst
    const complianceEfficiency = complianceHoursPerYear * analystHourlyRate * 0.7; // 70% efficiency improvement

    // Additional value from reduced stress and improved decision making
    const stressReductionValue = inputs.humanSOCAnalysts * 15000; // $15k per analyst for reduced stress

    // Value from 24/7 coverage without shift premiums
    const shiftCoverageValue = inputs.humanSOCAnalysts * 20000; // $20k per analyst for 24/7 coverage

    return {
      falsePositiveReduction,
      riskReduction,
      productivityImprovement,
      incidentResponseTime,
      analystRetention,
      complianceEfficiency,
      stressReduction: stressReductionValue,
      shiftCoverage: shiftCoverageValue,
    };
  };

  const valueMetrics = calculateValueMetrics();
  const totalValue = Object.values(valueMetrics).reduce((sum, value) => sum + value, 0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${((value / totalValue) * 100).toFixed(1)}%`;
  };

  const getColorForCategory = (index: number): string => {
    const colors = [
      '#60A5FA', // Blue
      '#34D399', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#6366F1'  // Indigo
    ];
    return colors[index % colors.length];
  };

  const valueCategories = [
    { name: 'False Positive Reduction', value: valueMetrics.falsePositiveReduction, description: 'Reduced analyst burnout and wasted time' },
    { name: 'Risk Reduction', value: valueMetrics.riskReduction, description: 'Prevented incident escalation costs' },
    { name: 'Productivity Improvement', value: valueMetrics.productivityImprovement, description: 'Analysts focus on high-value tasks' },
    { name: 'Faster Response Time', value: valueMetrics.incidentResponseTime, description: 'Reduced incident impact and costs' },
    { name: 'Analyst Retention', value: valueMetrics.analystRetention, description: 'Reduced turnover and training costs' },
    { name: 'Compliance Efficiency', value: valueMetrics.complianceEfficiency, description: 'Streamlined compliance processes' },
    { name: 'Stress Reduction', value: valueMetrics.stressReduction, description: 'Improved analyst well-being and decision making' },
    { name: '24/7 Coverage', value: valueMetrics.shiftCoverage, description: 'Continuous monitoring without shift premiums' },
  ].sort((a, b) => b.value - a.value); // Sort by value descending

  return (
    <Card sx={{ mb: 3, background: 'rgba(15, 15, 15, 0.8)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography level="h2" sx={{ mb: 1 }}>
          Value Creation Analysis
        </Typography>
        <Typography level="body-md" color="neutral">
          Breakdown of value created beyond direct cost savings
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <Card variant="soft" color="primary" sx={{ textAlign: 'center', p: 3, height: '11.125rem' }}>
            <Typography level="h4" sx={{ mb: 1 }}>
              Total Value Created
            </Typography>
            <Typography level="h1" sx={{ mb: 1, letterSpacing: '0.0125em', fontSize: '2.5rem' }}>
              {formatCurrency(totalValue)}
            </Typography>
            <Typography level="body-sm">
              Annual value beyond direct cost savings
            </Typography>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Direct Cost Savings:</Typography>
                <Typography level="body-lg" fontWeight="bold">
                  {formatCurrency(results.annualSavings)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Additional Value Created:</Typography>
                <Typography level="body-lg" fontWeight="bold">
                  {formatCurrency(totalValue)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography level="body-lg" fontWeight="bold">Total ROI Value:</Typography>
                <Typography level="h4" fontWeight="bold" color="primary">
                  {formatCurrency(results.annualSavings + totalValue)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography level="h4" sx={{ mb: 2 }}>
              Value Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart
                data={valueCategories.map((category, index) => ({
                  name: category.name,
                  value: category.value,
                  color: getColorForCategory(index),
                  description: category.description,
                }))}
                size={500}
                strokeWidth={100}
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography level="h4" sx={{ mb: 2 }}>
              Value Categories
            </Typography>
            <Stack spacing={3}>
              {valueCategories.map((category, index) => (
                <Box key={category.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getColorForCategory(index),
                        }}
                      />
                      <Typography level="body-sm" fontWeight="bold">
                        {category.name}
                      </Typography>
                    </Box>
                    <Typography level="body-sm" fontWeight="bold">
                      {formatCurrency(category.value)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, mr: 2 }} /> {/* Spacer to align with category name */}
                      <Typography level="body-xs" color="neutral">
                        {category.description}
                      </Typography>
                    </Box>
                    <Typography level="body-xs" color="neutral">
                      {formatPercentage(category.value)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
};
