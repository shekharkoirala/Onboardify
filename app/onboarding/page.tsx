"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Moon, Sun, Truck, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import FleetInfoStep from "./components/fleet-info-step"
import VehicleDetailsStep from "./components/vehicle-details-step"
import PreferencesStep from "./components/preferences-step"
import CompletionStep from "./components/completion-step"
import CSVUploadStep from "./components/csv-upload-step"
import { useTheme } from '@/hooks/use-theme'
import { cn } from "@/lib/utils"
import { SuccessPage } from "./components/success-page"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/components/auth-provider"

interface ProcessedDataRow {
  vehicleId: string
  vehicleName: string
  lat: number
  lon: number
  dateTime: string
  routeUrl: string
  vehicleCharging: boolean
  speedKmh: number
  batteryLevel: number | null
}

interface SchemaMapping {
  vehicleId: string
  vehicleName: string
  lat: string
  lon: string
  dateTime: string
  routeUrl: string
  vehicleCharging: string
  speedKmh: string
  batteryLevel: string
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isStepValid, setIsStepValid] = useState(false)
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fleetSize: "",
    companyName: "",
    vehicleTypes: [] as string[],
    vehicleModels: [] as string[],
    preferredManufacturers: [] as string[],
    energyCost: "",
    department: "",
    csvData: undefined as ProcessedDataRow[] | undefined,
    schemaMapping: undefined as SchemaMapping | undefined,
  })
  const { theme, toggleTheme } = useTheme()

  const steps = [
    { title: "Fleet Information", description: "Tell us about your fleet size" },
    { title: "Vehicle Details", description: "What types of vehicles do you operate?" },
    { title: "Preferences", description: "Additional information about your operations" },
    { title: "CSV Upload", description: "Upload your vehicle data" },
    { title: "Complete", description: "Review your information" },
  ]

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setHasAttemptedNext(true)
    if (currentStep < steps.length - 1 && isStepValid) {
      setCurrentStep((prev) => prev + 1)
      setHasAttemptedNext(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Validate that we have data to send
      if (!formData.csvData || !formData.schemaMapping) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload CSV data and map the columns before submitting.",
        })
        return;
      }

      // Format the data according to the backend's expected structure
      const payload = {
        csv_data: formData.csvData.map(row => ({
          vehicle_id: row.vehicleId,
          vehicle_name: row.vehicleName,
          lat: row.lat,
          lon: row.lon,
          date_time: row.dateTime,
          route_url: row.routeUrl,
          vehicle_charging: row.vehicleCharging,
          speed_kmh: row.speedKmh,
          battery_level: row.batteryLevel,
        })),
        mapping: {
          vehicle_id: formData.schemaMapping.vehicleId,
          vehicle_name: formData.schemaMapping.vehicleName,
          lat: formData.schemaMapping.lat,
          lon: formData.schemaMapping.lon,
          date_time: formData.schemaMapping.dateTime,
          route_url: formData.schemaMapping.routeUrl,
          vehicle_charging: formData.schemaMapping.vehicleCharging,
          speed_kmh: formData.schemaMapping.speedKmh,
          battery_level: formData.schemaMapping.batteryLevel,
        },
        onboarding_data: {
          fleet_size: formData.fleetSize,
          company_name: formData.companyName,
          vehicle_types: formData.vehicleTypes,
          vehicle_models: formData.vehicleModels,
          preferred_manufacturers: formData.preferredManufacturers,
          energy_cost: formData.energyCost,
          department: formData.department,
        },
        user_info: {
          id: user?.id || '',
          email: user?.email || '',
          name: user?.user_metadata?.full_name || '',
        },
      };

      console.log('Submitting data:', JSON.stringify(payload, null, 2));
      
      // Get the FastAPI URL from environment variables
      const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      console.log('FastAPI URL:', fastApiUrl);
      
      // Call the FastAPI backend directly
      const response = await fetch(`${fastApiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit data');
      }

      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "Success",
          description: "Your data has been successfully uploaded to FastAPI backend.",
        });
      } else {
        throw new Error(result.message || 'Failed to process data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    window.location.href = "/"
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <FleetInfoStep 
          formData={formData} 
          updateFormData={updateFormData} 
          onValidationChange={setIsStepValid}
          showError={hasAttemptedNext}
        />
      case 1:
        return <VehicleDetailsStep 
          formData={formData} 
          updateFormData={updateFormData}
          onValidationChange={setIsStepValid}
          showError={hasAttemptedNext}
        />
      case 2:
        return <PreferencesStep 
          formData={formData} 
          updateFormData={updateFormData}
          onValidationChange={setIsStepValid}
          showError={hasAttemptedNext}
        />
      case 3:
        return <CSVUploadStep 
          formData={formData} 
          updateFormData={updateFormData}
          onValidationChange={setIsStepValid}
          showError={hasAttemptedNext}
        />
      case 4:
        return <CompletionStep formData={formData} />
      default:
        return null
    }
  }

  if (isSuccess) {
    return (
      <SuccessPage
        title="Onboarding Complete!"
        message="Your fleet information has been successfully processed. You can now access your dashboard."
        actionText="Go to Dashboard"
        onAction={handleFinish}
      />
    )
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
        <Button 
          variant="ghost" 
          onClick={toggleTheme} 
          className="absolute right-4 top-4 size-10 rounded-full"
          size="icon"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <div className="w-full max-w-4xl">
          <div className="flex items-center mb-10">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Trucking Onboarding</h1>
          </div>

          <div className="mb-10">
            <div className="flex justify-between mb-6 relative">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center relative z-10 ${
                    index <= currentStep ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div 
                    className={cn(
                      "flex items-center justify-center size-10 rounded-full border-2 mb-2 transition-all duration-300",
                      index < currentStep 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : index === currentStep 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium hidden md:block",
                    index <= currentStep ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
              ))}
              
              {/* Connecting line */}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-muted-foreground/20 -z-0">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">
              Step {currentStep + 1} of {steps.length}: <span className="font-medium text-foreground">{steps[currentStep].title}</span>
            </div>
          </div>

          <Card className="w-full border shadow-lg">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {renderStep()}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 0 || isSubmitting}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={handleNext} 
                  className="group gap-2"
                  disabled={(!isStepValid && hasAttemptedNext) || isSubmitting}
                >
                  Next <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : currentStep === steps.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⚪</span>
                      Processing...
                    </>
                  ) : (
                    "Complete Onboarding"
                  )}
                </Button>
              ) : null}
            </CardFooter>
          </Card>
          
          {currentStep < steps.length - 1 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {currentStep === 0 ? (
                <p>Start by providing your fleet information to get started</p>
              ) : currentStep === 1 ? (
                <p>Tell us about the vehicles in your fleet</p>
              ) : currentStep === 2 ? (
                <p>Almost there! Just a few more preferences to set up</p>
              ) : (
                <p>Final step: Upload your vehicle data CSV file</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
