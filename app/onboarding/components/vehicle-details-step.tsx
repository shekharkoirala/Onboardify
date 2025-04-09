"use client"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "./multi-select"
import { useEffect } from "react"

interface VehicleDetailsStepProps {
  formData: {
    vehicleTypes: string[]
    vehicleModels: string[]
  }
  updateFormData: (data: Partial<{ vehicleTypes: string[]; vehicleModels: string[] }>) => void
  onValidationChange?: (isValid: boolean) => void
  showError?: boolean
}

const vehicleTypeOptions = [
  { label: "Van", value: "van" },
  { label: "Pickup Truck", value: "pickup" },
  { label: "Box Truck", value: "box" },
  { label: "Semi-Truck", value: "semi" },
  { label: "Dump Truck", value: "dump" },
  { label: "Flatbed Truck", value: "flatbed" },
  { label: "Tanker Truck", value: "tanker" },
]

const vehicleModelOptions = [
  { label: "Ford F-150", value: "ford-f150" },
  { label: "Ford Transit", value: "ford-transit" },
  { label: "Chevrolet Silverado", value: "chevy-silverado" },
  { label: "RAM 1500", value: "ram-1500" },
  { label: "Freightliner Cascadia", value: "freightliner-cascadia" },
  { label: "Peterbilt 579", value: "peterbilt-579" },
  { label: "Kenworth T680", value: "kenworth-t680" },
  { label: "Volvo VNL", value: "volvo-vnl" },
  { label: "International LT", value: "international-lt" },
]

export default function VehicleDetailsStep({ formData, updateFormData, onValidationChange, showError = false }: VehicleDetailsStepProps) {
  useEffect(() => {
    const isValid = formData.vehicleTypes.length > 0 && formData.vehicleModels.length > 0
    onValidationChange?.(isValid)
  }, [formData, onValidationChange])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="vehicleTypes">Vehicle Types</Label>
        <MultiSelect
          id="vehicleTypes"
          placeholder="Select vehicle types"
          options={vehicleTypeOptions}
          selected={formData.vehicleTypes}
          onChange={(selected) => {
            updateFormData({ vehicleTypes: selected })
            onValidationChange?.(selected.length > 0 && formData.vehicleModels.length > 0)
          }}
          className={showError && formData.vehicleTypes.length === 0 ? "border-red-500" : ""}
        />
        {showError && formData.vehicleTypes.length === 0 && (
          <p className="text-sm text-red-500">Select at least one vehicle type.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleModels">Current Vehicle Models</Label>
        <MultiSelect
          id="vehicleModels"
          placeholder="Select vehicle models"
          options={vehicleModelOptions}
          selected={formData.vehicleModels}
          onChange={(selected) => {
            updateFormData({ vehicleModels: selected })
            onValidationChange?.(formData.vehicleTypes.length > 0 && selected.length > 0)
          }}
          className={showError && formData.vehicleModels.length === 0 ? "border-red-500" : ""}
        />
        {showError && formData.vehicleModels.length === 0 && (
          <p className="text-sm text-red-500">Select at least one vehicle model.</p>
        )}
      </div>
    </div>
  )
}
