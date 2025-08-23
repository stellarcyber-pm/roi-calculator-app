import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import Accordion from '@mui/joy/Accordion';
import AccordionGroup from '@mui/joy/AccordionGroup';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Slider from '@mui/joy/Slider';
import { useColorScheme } from '@mui/joy/styles';
import { ValueAnalysis } from './value-analysis';
import { CircularSlider } from './circular-slider';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

interface CalculationInputs {
  // Company size inputs
  employeeCount: number;

  // Security metrics
  securityIncidentsPerMonth: number;
  averageIncidentResponseTime: number; // in hours
  falsePositiveRate: number; // percentage
  pricePerSecurityIncident: number; // in dollars

  // Human SOC costs
  humanSOCAnalysts: number;
  humanSOCManager: number;
  humanSOCEngineer: number;
  humanSOCDirector: number;



  // Additional costs
  legacySIEMPricePerGB: number;
  stellarXDRCostPerGB: number;
  switchFromLegacySIEM: boolean;

  // Log volume metrics
  logVolumeIncidentRatio: number;
  monthlyLogVolumeGB: number;
  stellarXDRPlatformCosts: number;
  siemLicensingCosts: number;
}

interface CalculationResults {
  humanSOCTotalCost: number;
  autonomousSOCTotalCost: number;
  adjustedAnnualSOCCost: number;
  platformSavings: number;
  annualSavings: number;
  roiPercentage: number;
  paybackPeriod: number; // in months
  efficiencyImprovement: number; // percentage
  incidentResponseImprovement: number; // percentage
}

const baseInputs = {
  employeeCount: 500,
  averageIncidentResponseTime: 4,
  falsePositiveRate: 90,
  pricePerSecurityIncident: 3,
  legacySIEMPricePerGB: 3,
  stellarXDRCostPerGB: 2,
  logVolumeIncidentRatio: 1.5,
  switchFromLegacySIEM: true,
};

// Helper function to calculate computed fields
const calculateComputedFields = (base: typeof baseInputs): CalculationInputs => {
  const ratio = 2400 / 500; // default incidents / default employees
  const securityIncidentsPerMonth = Math.round(base.employeeCount * ratio);
  const monthlyLogVolumeGB = Math.round(securityIncidentsPerMonth * base.logVolumeIncidentRatio);
  const stellarXDRPlatformCosts = monthlyLogVolumeGB * base.stellarXDRCostPerGB * 12;
  const siemLicensingCosts = monthlyLogVolumeGB * base.legacySIEMPricePerGB * 12;
  return {
    ...base,
    securityIncidentsPerMonth,
    monthlyLogVolumeGB,
    stellarXDRPlatformCosts,
    siemLicensingCosts,
    humanSOCAnalysts: Math.ceil(securityIncidentsPerMonth / 1000),
    humanSOCManager: Math.ceil(securityIncidentsPerMonth / 3000),
    humanSOCEngineer: Math.ceil(securityIncidentsPerMonth / 3000),
    humanSOCDirector: Math.ceil(securityIncidentsPerMonth / 6000),
  };
};

const defaultInputs = calculateComputedFields(baseInputs);

export const ROICalculator: React.FC = () => {
  // Load inputs from localStorage or use defaults
  const loadInputsFromStorage = (): CalculationInputs => {
    try {
      const saved = localStorage.getItem('roi-calculator-inputs');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with base inputs to handle any missing fields
        const loadedBaseInputs = { ...baseInputs, ...parsed };
        return calculateComputedFields(loadedBaseInputs);
      }
    } catch (error) {
      console.warn('Failed to load inputs from localStorage:', error);
    }
    return defaultInputs;
  };

  const [inputs, setInputs] = useState<CalculationInputs>(loadInputsFromStorage);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'monetary' | 'operational'>(() => {
    try {
      const saved = localStorage.getItem('roi-calculator-view-mode');
      return saved === 'operational' ? 'operational' : 'monetary';
    } catch {
      return 'monetary';
    }
  });
  const { mode } = useColorScheme();

  const calculateROI = useCallback((): CalculationResults => {
    // Human SOC annual costs
    const analystSalary = 85000;
    const managerSalary = 120000;
    const engineerSalary = 150000;
    const directorSalary = 200000;

    const humanSOCPersonnelCost = (
      inputs.humanSOCAnalysts * analystSalary +
      inputs.humanSOCManager * managerSalary +
      inputs.humanSOCEngineer * engineerSalary +
      inputs.humanSOCDirector * directorSalary
    );

    const humanSOCTotalCost = humanSOCPersonnelCost + inputs.siemLicensingCosts;

    // Autonomous SOC annual costs
    const autonomousSOCMonthlyCost = inputs.securityIncidentsPerMonth * inputs.pricePerSecurityIncident;
    const autonomousSOCAnnualCost = autonomousSOCMonthlyCost * 12;

    // Calculate dynamic efficiency improvements
    const calculateEfficiencyImprovement = (): number => {
      // Base efficiency improvement from automation
      const baseEfficiency = 38;

      // False positive rate impact: Higher false positive rates mean greater efficiency gains
      const falsePositiveImpact = Math.min(inputs.falsePositiveRate * 0.2, 15); // Max 15% additional

      // Response time impact: Slower response times indicate greater efficiency potential
      const responseTimeImpact = Math.min(inputs.averageIncidentResponseTime * 3, 25); // Max 25% additional

      // Log volume impact: Higher log volumes mean greater efficiency gains from automation
      // For every GB in excess of 1 TiB (1024 GB), add 1% improvement up to 15% maximum
      const oneTiBInGB = 1024;
      const excessLogVolume = Math.max(0, inputs.monthlyLogVolumeGB - oneTiBInGB);
      const logVolumeImpact = Math.min(excessLogVolume * 0.001, 15); // 0.001 = 1% per GB, max 15%

      const totalEfficiency = baseEfficiency + falsePositiveImpact + responseTimeImpact + logVolumeImpact;

      // Cap at 80% maximum efficiency improvement
      return Math.min(totalEfficiency, 80);
    };

    const calculateIncidentResponseImprovement = (): number => {
      // Base response time improvement
      const baseImprovement = 45;

      // Current response time impact: Slower response times mean greater improvement potential
      const responseTimeImpact = Math.min(inputs.averageIncidentResponseTime * 2, 15); // Max 15% additional

      // False positive impact: Higher false positives mean more time wasted, so greater improvement
      const falsePositiveImpact = Math.min(inputs.falsePositiveRate * 0.15, 8); // Max 8% additional

      const totalImprovement = baseImprovement + responseTimeImpact + falsePositiveImpact;

      // Cap at 80% maximum response improvement
      return Math.min(totalImprovement, 80);
    };

    const efficiencyImprovement = calculateEfficiencyImprovement();
    const incidentResponseImprovement = calculateIncidentResponseImprovement();

    // Calculate adjusted annual SOC cost (efficiency-adjusted human cost only)
    const adjustedAnnualSOCCost = humanSOCTotalCost * (1 - efficiencyImprovement / 100);

    // Calculate platform savings (SIEM licensing costs - Stellar XDR platform costs)
    const platformSavings = inputs.siemLicensingCosts - inputs.stellarXDRPlatformCosts;

    // Calculate savings and ROI
    const annualSavings = humanSOCTotalCost - (adjustedAnnualSOCCost + autonomousSOCAnnualCost) + platformSavings;

    // Calculate ROI percentage, return 0 if autonomousSOCAnnualCost is 0 to avoid NaN
    const roiPercentage = autonomousSOCAnnualCost === 0 ? 0 : (annualSavings / autonomousSOCAnnualCost) * 100;
    const paybackPeriod = 0; // No setup costs, immediate ROI

    return {
      humanSOCTotalCost,
      autonomousSOCTotalCost: autonomousSOCAnnualCost,
      adjustedAnnualSOCCost,
      platformSavings,
      annualSavings,
      roiPercentage,
      paybackPeriod,
      efficiencyImprovement,
      incidentResponseImprovement,
    };
  }, [inputs]);

  useEffect(() => {
    setResults(calculateROI());
  }, [inputs, calculateROI]);

  useEffect(() => {
    try {
      localStorage.setItem('roi-calculator-view-mode', viewMode);
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
  }, [viewMode]);

  const handleInputChange = (field: keyof CalculationInputs, value: string | number | boolean) => {
    setInputs(prev => {
      const newInputs = {
        ...prev,
        [field]: value,
      };

      // If employee count changes, update security incidents per month proportionally
      if (field === 'employeeCount') {
        const ratio = defaultInputs.securityIncidentsPerMonth / defaultInputs.employeeCount;
        const newIncidents = Math.round(Number(value) * ratio);
        newInputs.securityIncidentsPerMonth = newIncidents;

        // Also update SOC staff based on the new incident count
        newInputs.humanSOCAnalysts = Math.ceil(newIncidents / 1000);
        newInputs.humanSOCManager = Math.ceil(newIncidents / 3000);
        newInputs.humanSOCEngineer = Math.ceil(newIncidents / 3000);
        newInputs.humanSOCDirector = Math.ceil(newIncidents / 6000);

        // Update monthly log volume
        const newLogVolume = Math.round(newIncidents * newInputs.logVolumeIncidentRatio);
        newInputs.monthlyLogVolumeGB = newLogVolume;

        // Update Stellar XDR Platform Costs
        newInputs.stellarXDRPlatformCosts = newLogVolume * newInputs.stellarXDRCostPerGB * 12;

        // Update SIEM Licensing Costs
        newInputs.siemLicensingCosts = newLogVolume * newInputs.legacySIEMPricePerGB * 12;
      }

      // If security incidents per month changes, update employee count proportionally
      if (field === 'securityIncidentsPerMonth') {
        const incidents = Number(value);
        const ratio = defaultInputs.securityIncidentsPerMonth / defaultInputs.employeeCount;
        const newEmployeeCount = Math.round(incidents / ratio);
        newInputs.employeeCount = newEmployeeCount;

        // Also update SOC staff based on the new incident count
        newInputs.humanSOCAnalysts = Math.ceil(incidents / 1000);
        newInputs.humanSOCManager = Math.ceil(incidents / 3000);
        newInputs.humanSOCEngineer = Math.ceil(incidents / 3000);
        newInputs.humanSOCDirector = Math.ceil(incidents / 6000);

        // Update monthly log volume
        const newLogVolume = Math.round(incidents * newInputs.logVolumeIncidentRatio);
        newInputs.monthlyLogVolumeGB = newLogVolume;

        // Update Stellar XDR Platform Costs
        newInputs.stellarXDRPlatformCosts = newLogVolume * newInputs.stellarXDRCostPerGB * 12;

        // Update SIEM Licensing Costs
        newInputs.siemLicensingCosts = newLogVolume * newInputs.legacySIEMPricePerGB * 12;
      }

      // If log volume incident ratio changes, update monthly log volume
      if (field === 'logVolumeIncidentRatio') {
        const newLogVolume = Math.round(newInputs.securityIncidentsPerMonth * Number(value));
        newInputs.monthlyLogVolumeGB = newLogVolume;
        newInputs.stellarXDRPlatformCosts = newLogVolume * newInputs.stellarXDRCostPerGB * 12;
        newInputs.siemLicensingCosts = newLogVolume * newInputs.legacySIEMPricePerGB * 12;
      }

      // If stellar XDR cost per GB changes, update platform costs
      if (field === 'stellarXDRCostPerGB') {
        newInputs.stellarXDRPlatformCosts = newInputs.monthlyLogVolumeGB * Number(value) * 12;
      }

      // If legacy SIEM price per GB changes, update SIEM licensing costs
      if (field === 'legacySIEMPricePerGB') {
        newInputs.siemLicensingCosts = newInputs.monthlyLogVolumeGB * Number(value) * 12;
      }

      // Save to localStorage (only the base fields, not computed ones)
      try {
        const baseFieldsToSave = {
          employeeCount: newInputs.employeeCount,
          averageIncidentResponseTime: newInputs.averageIncidentResponseTime,
          falsePositiveRate: newInputs.falsePositiveRate,
          pricePerSecurityIncident: newInputs.pricePerSecurityIncident,
          legacySIEMPricePerGB: newInputs.legacySIEMPricePerGB,
          stellarXDRCostPerGB: newInputs.stellarXDRCostPerGB,
          logVolumeIncidentRatio: newInputs.logVolumeIncidentRatio,
          switchFromLegacySIEM: newInputs.switchFromLegacySIEM,
        };
        localStorage.setItem('roi-calculator-inputs', JSON.stringify(baseFieldsToSave));
      } catch (error) {
        console.warn('Failed to save inputs to localStorage:', error);
      }
      return newInputs;
    });
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

  const formatHours = (hours: number): string => {
    return `${Math.round(hours).toLocaleString()} hrs`;
  };

  const renderCheckboxField = (
    label: string,
    field: keyof CalculationInputs,
    checked: boolean,
    onChange: (checked: boolean) => void
  ) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
        <Typography level="body-sm">
          {label}
        </Typography>
      </Box>
    </Box>
  );

  const renderInputField = (
    label: string,
    field: keyof CalculationInputs,
    type: 'number' | 'text' = 'number',
    options?: { min?: number; max?: number; step?: number }
  ) => {
    const value = inputs[field];
    // Skip rendering if the field is a boolean (should use renderCheckboxField instead)
    if (typeof value === 'boolean') {
      return null;
    }

    return (
      <Box>
        <Typography level="body-sm" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Input
          type={type}
          value={value}
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
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        maxWidth: '75rem',
        mx: 'auto',
        width: '100%',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        backdropFilter: 'none',
        px: 2,
        py: 1,
        m: '0 auto',
      }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 10 }}>
          <img
            src="/logo.svg"
            alt="Stellar Cyber Logo"
            style={{
              height: '32px',
              width: 'auto',
              filter: mode === 'dark' ? 'brightness(0) invert(1)' : 'none'
            }}
          />
          <Typography level="h1" sx={{
            flexGrow: 1,
            textAlign: 'right',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 'bold',
            marginTop: '-0.25rem',
            color: mode === 'dark' ? 'white' : 'text.primary',
          }}>
            Autonomous SOC ROI Calculator
          </Typography>
        </Box>
        {/* <IconButton
          variant="outlined"
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          sx={{ borderRadius: '50%' }}
        >
          {mode === 'dark' ? '☀️' : '🌙'}
        </IconButton> */}
      </Box>

      <Box sx={{ mt: 4, p: 2 }}>
        <Card sx={{ mb: 3, background: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(10px)', maxWidth: '75rem', mx: 'auto' }}>
          <Grid container spacing={3}>
            {/* Configuration Controls */}
            <Grid xs={12} md={5}>
              <Box sx={{ p: 3, background: 'rgba(25, 25, 25, 0.6)', borderRadius: '0.6rem', height: '100%' }}>
                <Grid container spacing={4} sx={{ mb: 3 }}>
                  <Grid xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularSlider
                        value={inputs.employeeCount}
                        onChange={(value) => handleInputChange('employeeCount', value)}
                        min={0}
                        max={5000}
                        step={50}
                        label="Number of Employees"
                        size={400}
                      />
                    </Box>
                  </Grid>
                  <Grid xs={12}>
                    <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
                      <Box>
                        <Divider sx={{ mb: 6, mt: 2 }} />
                        <Typography level="body-sm" sx={{ mb: 1, textAlign: 'center' }}>
                          Security Incidents per Month: {inputs.securityIncidentsPerMonth.toLocaleString()}
                        </Typography>
                        <Slider
                          value={inputs.securityIncidentsPerMonth}
                          onChange={(_, value) => handleInputChange('securityIncidentsPerMonth', value as number)}
                          min={0}
                          max={24000}
                          step={10}
                          size="sm"
                          sx={{ width: '100%' }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setIsModalOpen(true)}
                      >
                        Model Customization
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* ROI Analysis Results */}
            <Grid xs={12} md={7}>
              {results && (
                <Box sx={{ p: 3, height: '100%' }}>
                  {(() => {
                    const totalHeadcount = inputs.humanSOCAnalysts + inputs.humanSOCManager + inputs.humanSOCEngineer + inputs.humanSOCDirector;
                    const optimizedHeadcount = Math.max(0, Math.ceil(totalHeadcount * (1 - results.efficiencyImprovement / 100)));
                    const freedEmployees = Math.max(0, totalHeadcount - optimizedHeadcount);
                    const monthlyHoursPerEmployee = 2080 / 12;
                    const monthlyTimeSavings = totalHeadcount * monthlyHoursPerEmployee * (results.efficiencyImprovement / 100);
                    const annualTimeSavings = monthlyTimeSavings * 12;

                    return (
                      <>
                        {viewMode === 'monetary' ? (
                          <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                  : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                color: mode === 'dark' ? 'white' : '#374151',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#374151'
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
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                  : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                color: mode === 'dark' ? 'white' : '#059669',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#059669'
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
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                  : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                color: mode === 'dark' ? 'white' : '#374151',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#374151'
                                }
                              }}>
                                <Typography level="h4">Adjusted Annual SOC Cost</Typography>
                                <Typography level="h2">
                                  {formatCurrency(results.adjustedAnnualSOCCost)}
                                </Typography>
                                <Typography level="body-sm">
                                  Efficiency-adjusted human SOC cost
                                </Typography>
                              </Card>
                            </Grid>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                  : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                color: mode === 'dark' ? 'white' : '#059669',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#059669'
                                }
                              }}>
                                <Typography level="h4">Platform Savings</Typography>
                                <Typography level="h2">
                                  {formatCurrency(results.platformSavings)}
                                </Typography>
                                <Typography level="body-sm">
                                  Stellar XDR platform savings
                                </Typography>
                              </Card>
                            </Grid>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                                  : 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
                                color: mode === 'dark' ? 'white' : '#7c3aed',
                                height: '100%',
                                minHeight: '12rem',
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
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                  : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                color: mode === 'dark' ? 'white' : '#059669',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#059669'
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
                          </Grid>
                        ) : (
                          <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                  : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                color: mode === 'dark' ? 'white' : '#374151',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#374151'
                                }
                              }}>
                                <Typography level="h4">Total SOC Headcount</Typography>
                                <Typography level="h2">
                                  {totalHeadcount.toLocaleString()}
                                </Typography>
                                <Typography level="body-sm">
                                  Current combined team size
                                </Typography>
                              </Card>
                            </Grid>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                  : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                color: mode === 'dark' ? 'white' : '#059669',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#059669'
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
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                  : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                color: mode === 'dark' ? 'white' : '#374151',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#374151'
                                }
                              }}>
                                <Typography level="h4">Freed Employees</Typography>
                                <Typography level="h2">
                                  {freedEmployees.toLocaleString()}
                                </Typography>
                                <Typography level="body-sm">
                                  Team members freed for higher-value work
                                </Typography>
                              </Card>
                            </Grid>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                  : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                color: mode === 'dark' ? 'white' : '#059669',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#059669'
                                }
                              }}>
                                <Typography level="h4">Monthly Time Savings</Typography>
                                <Typography level="h2">
                                  {formatHours(monthlyTimeSavings)}
                                </Typography>
                                <Typography level="body-sm">
                                  Saved worker hours per month
                                </Typography>
                              </Card>
                            </Grid>
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                                  : 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
                                color: mode === 'dark' ? 'white' : '#7c3aed',
                                height: '100%',
                                minHeight: '12rem',
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
                            <Grid xs={12} sm={6}>
                              <Card sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                  : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                                color: mode === 'dark' ? 'white' : '#059669',
                                height: '100%',
                                minHeight: '12rem',
                                '& .MuiTypography-root': {
                                  color: mode === 'dark' ? 'white' : '#059669'
                                }
                              }}>
                                <Typography level="h4">Annual Time Savings</Typography>
                                <Typography level="h2">
                                  {formatHours(annualTimeSavings)}
                                </Typography>
                                <Typography level="body-sm">
                                  Saved worker hours per year
                                </Typography>
                              </Card>
                            </Grid>
                          </Grid>
                        )}

                        <Box sx={{ mt: 2 }}>
                          <Select
                            value={viewMode}
                            onChange={(_, value) => {
                              if (value === 'monetary' || value === 'operational') {
                                setViewMode(value);
                              }
                            }}
                            size="sm"
                          >
                            <Option value="monetary">Show value as a monetary figures</Option>
                            <Option value="operational">Show value as operational figures</Option>
                          </Select>
                        </Box>
                      </>
                    );
                  })()}
                </Box>
              )}
            </Grid>
          </Grid>
        </Card>

        {/* Key Benefits of Autonomous SOC */}
        {results && (
          <Card sx={{ mb: 3, background: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(10px)', maxWidth: '75rem', mx: 'auto' }}>
            <Box sx={{ p: 3 }}>
              <Typography level="h4" sx={{ mb: 2 }}>
                Key Benefits of Autonomous SOC
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2 }}>
                    <Box sx={{ mb: 1 }}><img src="/monitoring.svg" alt="24/7 monitoring and response" style={{ width: '2.5rem', height: '2.5rem' }} /></Box>
                    <Typography level="body-sm">24/7 monitoring and response</Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2, position: 'relative' }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: '60%',
                      backgroundColor: 'divider',
                      display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{ mb: 1 }}><img src="/checkbox.svg" alt="Reduced false positives" style={{ width: '2.5rem', height: '2.5rem' }} /></Box>
                    <Typography level="body-sm">Reduced false positives by 95%</Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2, position: 'relative' }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: '60%',
                      backgroundColor: 'divider',
                      display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{ mb: 1 }}><img src="/stopwatch.svg" alt="Faster incident response" style={{ width: '2.5rem', height: '2.5rem' }} /></Box>
                    <Typography level="body-sm">{formatPercentage(results.incidentResponseImprovement)} faster incident response</Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2, position: 'relative' }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: '60%',
                      backgroundColor: 'divider',
                      display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{ mb: 1 }}><img src="/scalability.svg" alt="Scalable security operations" style={{ width: '2.5rem', height: '2.5rem' }} /></Box>
                    <Typography level="body-sm">Scalable security operations</Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2, position: 'relative' }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: '60%',
                      backgroundColor: 'divider',
                      display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{ mb: 1 }}><img src="/shield.svg" alt="Reduced human error and fatigue" style={{ width: '2.5rem', height: '2.5rem' }} /></Box>
                    <Typography level="body-sm">Reduced human error and fatigue</Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2, position: 'relative' }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: '60%',
                      backgroundColor: 'divider',
                      display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{ mb: 1 }}><img src="/radar.svg" alt="Advanced threat detection with AI/ML" style={{ width: '2.5rem', height: '2.5rem' }} /></Box>
                    <Typography level="body-sm">Advanced threat detection</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        )}

        {/* Value Creation Analysis */}
        {results && (
          <Card sx={{ mb: 3, background: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(10px)', maxWidth: '75rem', mx: 'auto' }}>
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
          </Card>
        )}
      </Box>

      {/* Model Customization Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalDialog
          aria-labelledby="customization-modal"
          size="lg"
          sx={{
            maxWidth: '800px',
            width: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Fixed Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Typography level="h2">
              Model Customization
            </Typography>
            <ModalClose />
          </Box>

                    {/* Scrollable Content */}
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            pt: 2
          }}>

            <AccordionGroup>
              {/* Basic Configuration */}
              <Accordion defaultExpanded>
                <AccordionSummary>
                  <Typography level="h4">Basic Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {renderInputField('Number of Employees', 'employeeCount', 'number', { min: 1 })}
                    {renderInputField('Security Incidents per Month', 'securityIncidentsPerMonth', 'number', { min: 0 })}
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Security Metrics */}
              <Accordion defaultExpanded>
                <AccordionSummary>
                  <Typography level="h4">Security Metrics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {renderInputField('Average Incident Response Time (hours)', 'averageIncidentResponseTime', 'number', { min: 0, step: 0.5 })}
                    {renderInputField('False Positive Rate (%)', 'falsePositiveRate', 'number', { min: 0, max: 100, step: 0.1 })}
                    {renderInputField('Price per Security Incident ($)', 'pricePerSecurityIncident', 'number', { min: 0 })}
                    {renderInputField('Log Volume Incident Ratio', 'logVolumeIncidentRatio', 'number', { min: 0, step: 0.1 })}
                    {renderInputField('Monthly Log Volume (GB)', 'monthlyLogVolumeGB', 'number', { min: 0 })}
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

              {/* Additional Costs */}
              <Accordion defaultExpanded>
                <AccordionSummary>
                  <Typography level="h4">Additional Costs</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                                      {renderInputField('Legacy SIEM Price per GB ($)', 'legacySIEMPricePerGB', 'number', { min: 0, step: 0.01 })}
                  {renderInputField('Annual SIEM Licensing Costs ($)', 'siemLicensingCosts', 'number', { min: 0 })}
                  {renderInputField('Stellar XDR Cost per GB ($)', 'stellarXDRCostPerGB', 'number', { min: 0, step: 0.01 })}
                  {renderInputField('Annual Stellar XDR Platform Costs ($)', 'stellarXDRPlatformCosts', 'number', { min: 0 })}
                    {renderCheckboxField(
                      'Switch from Legacy SIEM',
                      'switchFromLegacySIEM',
                      inputs.switchFromLegacySIEM,
                      (checked) => handleInputChange('switchFromLegacySIEM', checked)
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </AccordionGroup>
          </Box>

          {/* Fixed Footer */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setInputs(defaultInputs);
                // Clear localStorage when resetting to defaults
                try {
                  localStorage.removeItem('roi-calculator-inputs');
                } catch (error) {
                  console.warn('Failed to clear localStorage:', error);
                }
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};
