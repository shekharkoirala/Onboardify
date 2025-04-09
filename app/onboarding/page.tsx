"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Moon, Sun, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import FleetInfoStep from "./components/fleet-info-step"
import VehicleDetailsStep from "./components/vehicle-details-step"
import PreferencesStep from "./components/preferences-step"
import CompletionStep from "./components/completion-step"
import CSVUploadStep from "./components/csv-upload-step"
import { useTheme } from '@/hooks/use-theme'

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
  const [formData, setFormData] = useState({
    fleetSize: "",
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

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
    // Move to completion step
    setCurrentStep(steps.length - 1)
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

  return (
    <div className="min-h-screen bg-dark-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
      <Button variant="ghost" onClick={toggleTheme} className="absolute right-4 top-4">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <div className="flex items-center mb-8">
          <Truck className="h-8 w-8 mr-2 text-dark-700" />
          <h1 className="text-2xl font-bold text-dark-800">Trucking Onboarding</h1>
        </div>


        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`text-sm font-medium ${
                  index === currentStep ? "text-dark-800" : index < currentStep ? "text-dark-600" : "text-dark-400"
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2 bg-dark-100 [&>div]:bg-dark-600" />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : currentStep === steps.length - 1 ? (
              <Button onClick={() => (window.location.href = "/")}>Finish</Button>
            ) : (
              <Button onClick={handleSubmit}>Submit</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
