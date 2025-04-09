"use client"

import type { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "./multi-select"
import { useEffect } from "react"

interface PreferencesStepProps {
  formData: {
    preferredManufacturers: string[]
    energyCost: string
    department: string
  }
  updateFormData: (
    data: Partial<{
      preferredManufacturers: string[]
      energyCost: string
      department: string
    }>,
  ) => void
  onValidationChange?: (isValid: boolean) => void
  showError?: boolean
}

const manufacturerOptions = [
  { label: "Ford", value: "ford" },
  { label: "Chevrolet", value: "chevrolet" },
  { label: "RAM", value: "ram" },
  { label: "Toyota", value: "toyota" },
  { label: "Freightliner", value: "freightliner" },
  { label: "Peterbilt", value: "peterbilt" },
  { label: "Kenworth", value: "kenworth" },
  { label: "Volvo", value: "volvo" },
  { label: "International", value: "international" },
  { label: "Mack", value: "mack" },
]

export default function PreferencesStep({ formData, updateFormData, onValidationChange, showError = false }: PreferencesStepProps) {
  useEffect(() => {
    const isValid = formData.preferredManufacturers.length > 0 && 
                   formData.energyCost.trim() !== "" && 
                   formData.department.trim() !== ""
    onValidationChange?.(isValid)
  }, [formData, onValidationChange])

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    updateFormData({ [name]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="preferredManufacturers">Preferred Manufacturers</Label>
        <MultiSelect
          id="preferredManufacturers"
          placeholder="Select preferred manufacturers"
          options={manufacturerOptions}
          selected={formData.preferredManufacturers}
          onChange={(selected) => {
            updateFormData({ preferredManufacturers: selected })
            onValidationChange?.(
              selected.length > 0 && 
              formData.energyCost.trim() !== "" && 
              formData.department.trim() !== ""
            )
          }}
          className={showError && formData.preferredManufacturers.length === 0 ? "border-red-500" : ""}
        />
        {showError && formData.preferredManufacturers.length === 0 && (
          <p className="text-sm text-red-500">Select at least one preferred manufacturer.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="energyCost">Average Energy Cost (per kWh)</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-500">$</span>
          <Input
            type="number"
            id="energyCost"
            name="energyCost"
            step="0.01"
            placeholder="0.12"
            value={formData.energyCost}
            onChange={handleChange}
            className={`pl-7 ${showError && !formData.energyCost.trim() ? "border-red-500" : ""}`}
          />
        </div>
        {showError && !formData.energyCost.trim() && (
          <p className="text-sm text-red-500">Please enter your average energy cost.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          type="text"
          id="department"
          name="department"
          placeholder="Enter your department name"
          value={formData.department}
          onChange={handleChange}
          className={showError && !formData.department.trim() ? "border-red-500" : ""}
        />
        {showError && !formData.department.trim() && (
          <p className="text-sm text-red-500">Please enter your department name.</p>
        )}
      </div>
    </div>
  )
}
