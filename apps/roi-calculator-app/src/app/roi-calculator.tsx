import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Accordion from '@mui/joy/Accordion';
import AccordionGroup from '@mui/joy/AccordionGroup';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import { useColorScheme } from '@mui/joy/styles';
import { ValueAnalysis } from './value-analysis';

interface CalculationInputs {
  // Company size inputs
  employeeCount: number;

  // Security metrics
  securityIncidentsPerMonth: number;
  averageIncidentResponseTime: number; // in hours
  falsePositiveRate: number; // percentage

  // Human SOC costs
  humanSOCAnalysts: number;
  humanSOCManager: number;
  humanSOCEngineer: number;
  humanSOCDirector: number;

  // Autonomous SOC costs
  autonomousSOCMonthlyCost: number;
  autonomousSOCSetupCost: number;

  // Additional costs
  toolingCosts: number;
  trainingCosts: number;
  infrastructureCosts: number;
}

interface CalculationResults {
  humanSOCTotalCost: number;
  autonomousSOCTotalCost: number;
  annualSavings: number;
  roiPercentage: number;
  paybackPeriod: number; // in months
  efficiencyImprovement: number; // percentage
  incidentResponseImprovement: number; // percentage
}

const defaultInputs: CalculationInputs = {
  employeeCount: 500,
  securityIncidentsPerMonth: 50,
  averageIncidentResponseTime: 4,
  falsePositiveRate: 30,
  humanSOCAnalysts: 3,
  humanSOCManager: 1,
  humanSOCEngineer: 1,
  humanSOCDirector: 1,
  autonomousSOCMonthlyCost: 15000,
  autonomousSOCSetupCost: 50000,
  toolingCosts: 25000,
  trainingCosts: 15000,
  infrastructureCosts: 20000,
};

export const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>(defaultInputs);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const { mode, setMode } = useColorScheme();

  const calculateROI = (): CalculationResults => {
    // Human SOC annual costs
    const analystSalary = 85000;
    const managerSalary = 120000;
    const engineerSalary = 110000;
    const directorSalary = 150000;

    const humanSOCPersonnelCost = (
      inputs.humanSOCAnalysts * analystSalary +
      inputs.humanSOCManager * managerSalary +
      inputs.humanSOCEngineer * engineerSalary +
      inputs.humanSOCDirector * directorSalary
    );

    const humanSOCTotalCost = humanSOCPersonnelCost + inputs.toolingCosts + inputs.trainingCosts + inputs.infrastructureCosts;

    // Autonomous SOC annual costs
    const autonomousSOCAnnualCost = inputs.autonomousSOCMonthlyCost * 12 + inputs.autonomousSOCSetupCost;

    // Calculate savings and ROI
    const annualSavings = humanSOCTotalCost - autonomousSOCAnnualCost;
    const roiPercentage = (annualSavings / autonomousSOCAnnualCost) * 100;
    const paybackPeriod = (inputs.autonomousSOCSetupCost / annualSavings) * 12;

    // Efficiency improvements
    const efficiencyImprovement = 75; // Autonomous SOC is typically 75% more efficient
    const incidentResponseImprovement = 85; // 85% faster response time

    return {
      humanSOCTotalCost,
      autonomousSOCTotalCost: autonomousSOCAnnualCost,
      annualSavings,
      roiPercentage,
      paybackPeriod,
      efficiencyImprovement,
      incidentResponseImprovement,
    };
  };

  useEffect(() => {
    setResults(calculateROI());
  }, [inputs]);

  const handleInputChange = (field: keyof CalculationInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };



  const renderInputField = (
    label: string,
    field: keyof CalculationInputs,
    type: 'number' | 'text' = 'number',
    options?: { min?: number; max?: number; step?: number }
  ) => (
    <Box>
      <Typography level="body-sm" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Input
        type={type}
        value={inputs[field]}
        onChange={(e) => handleInputChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        slotProps={{
          input: {
            min: options?.min,
            max: options?.max,
            step: options?.step,
          },
        }}
        size="sm"
      />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Theme Toggle */}
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <IconButton
          variant="outlined"
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          sx={{ borderRadius: '50%' }}
        >
          {mode === 'dark' ? '☀️' : '🌙'}
        </IconButton>
      </Box>

      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Grid xs={12} lg={2.5}>
          <Box sx={{ p: 2, height: '100vh', overflowY: 'auto' }}>
        <AccordionGroup>
          {/* Company Information */}
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography level="h4">Company Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {renderInputField('Number of Employees', 'employeeCount', 'number', { min: 1 })}
                {renderInputField('Security Incidents per Month', 'securityIncidentsPerMonth', 'number', { min: 0 })}
                {renderInputField('Average Incident Response Time (hours)', 'averageIncidentResponseTime', 'number', { min: 0, step: 0.5 })}
                {renderInputField('False Positive Rate (%)', 'falsePositiveRate', 'number', { min: 0, max: 100, step: 0.1 })}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Human SOC Team */}
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography level="h4">Human SOC Team</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {renderInputField('SOC Analysts', 'humanSOCAnalysts', 'number', { min: 0 })}
                {renderInputField('SOC Managers', 'humanSOCManager', 'number', { min: 0 })}
                {renderInputField('SOC Engineers', 'humanSOCEngineer', 'number', { min: 0 })}
                {renderInputField('SOC Director', 'humanSOCDirector', 'number', { min: 0 })}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Autonomous SOC Costs */}
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography level="h4">Autonomous SOC Costs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {renderInputField('Monthly Subscription Cost ($)', 'autonomousSOCMonthlyCost', 'number', { min: 0 })}
                {renderInputField('One-time Setup Cost ($)', 'autonomousSOCSetupCost', 'number', { min: 0 })}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Additional Costs */}
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography level="h4">Additional Costs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {renderInputField('Annual Tooling Costs ($)', 'toolingCosts', 'number', { min: 0 })}
                {renderInputField('Annual Training Costs ($)', 'trainingCosts', 'number', { min: 0 })}
                {renderInputField('Annual Infrastructure Costs ($)', 'infrastructureCosts', 'number', { min: 0 })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid xs={12} lg={9.5}>
          <Box sx={{ p: 3, height: '100vh', overflowY: 'auto' }}>
            {results && (
              <Card sx={{ mb: 3 }}>
                <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
                  ROI Analysis Results
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                        : 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                      color: mode === 'dark' ? 'white' : '#dc2626',
                      '& .MuiTypography-root': {
                        color: mode === 'dark' ? 'white' : '#dc2626'
                      }
                    }}>
                      <Typography level="h4">Human SOC Annual Cost</Typography>
                      <Typography level="h2">
                        {formatCurrency(results.humanSOCTotalCost)}
                      </Typography>
                      <Typography level="body-sm">
                        Traditional security operations center with human analysts
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                      color: mode === 'dark' ? 'white' : '#059669',
                      '& .MuiTypography-root': {
                        color: mode === 'dark' ? 'white' : '#059669'
                      }
                    }}>
                      <Typography level="h4">Autonomous SOC Annual Cost</Typography>
                      <Typography level="h2">
                        {formatCurrency(results.autonomousSOCTotalCost)}
                      </Typography>
                      <Typography level="body-sm">
                        AI-powered autonomous security operations
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
                      color: mode === 'dark' ? 'white' : '#3b82f6',
                      '& .MuiTypography-root': {
                        color: mode === 'dark' ? 'white' : '#3b82f6'
                      }
                    }}>
                      <Typography level="h4">Annual Savings</Typography>
                      <Typography level="h2">
                        {formatCurrency(results.annualSavings)}
                      </Typography>
                      <Typography level="body-sm">
                        Cost reduction with Autonomous SOC
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                        : 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
                      color: mode === 'dark' ? 'white' : '#7c3aed',
                      '& .MuiTypography-root': {
                        color: mode === 'dark' ? 'white' : '#7c3aed'
                      }
                    }}>
                      <Typography level="h4">ROI</Typography>
                      <Typography level="h2">
                        {formatPercentage(results.roiPercentage)}
                      </Typography>
                      <Typography level="body-sm">
                        Return on investment
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                        : 'linear-gradient(135deg, #a5f3fc 0%, #67e8f9 100%)',
                      color: mode === 'dark' ? 'white' : '#0891b2',
                      '& .MuiTypography-root': {
                        color: mode === 'dark' ? 'white' : '#0891b2'
                      }
                    }}>
                      <Typography level="h4">Payback Period</Typography>
                      <Typography level="h2">
                        {results.paybackPeriod.toFixed(1)} months
                      </Typography>
                      <Typography level="body-sm">
                        Time to recover initial investment
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                        : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                      color: mode === 'dark' ? 'white' : '#16a34a',
                      '& .MuiTypography-root': {
                        color: mode === 'dark' ? 'white' : '#16a34a'
                      }
                    }}>
                      <Typography level="h4">Efficiency Improvement</Typography>
                      <Typography level="h2">
                        {formatPercentage(results.efficiencyImprovement)}
                      </Typography>
                      <Typography level="body-sm">
                        Operational efficiency gain
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Card variant="outlined">
                  <Typography level="h4" sx={{ mb: 2 }}>
                    Key Benefits of Autonomous SOC
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>• 24/7 threat monitoring and response</Typography>
                    <Typography>• Reduced false positives by {formatPercentage(90 - inputs.falsePositiveRate)}</Typography>
                    <Typography>• {formatPercentage(results.incidentResponseImprovement)} faster incident response</Typography>
                    <Typography>• Scalable security operations</Typography>
                    <Typography>• Reduced human error and fatigue</Typography>
                    <Typography>• Advanced threat detection with AI/ML</Typography>
                  </Stack>
                </Card>
              </Card>
            )}

            {results && (
              <ValueAnalysis
                inputs={{
                  falsePositiveRate: inputs.falsePositiveRate,
                  securityIncidentsPerMonth: inputs.securityIncidentsPerMonth,
                  averageIncidentResponseTime: inputs.averageIncidentResponseTime,
                  humanSOCAnalysts: inputs.humanSOCAnalysts,
                  employeeCount: inputs.employeeCount,
                }}
                results={{
                  annualSavings: results.annualSavings,
                  humanSOCTotalCost: results.humanSOCTotalCost,
                  autonomousSOCTotalCost: results.autonomousSOCTotalCost,
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
