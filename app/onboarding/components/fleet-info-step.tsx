"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { truncate } from "fs/promises"
import type { FormEvent } from "react"
import { useState, useEffect } from "react"

interface FleetInfoStepProps {
  formData: {
    fleetSize: string
  }
  updateFormData: (data: Partial<{ fleetSize: string }>) => void
  onValidationChange?: (isValid: boolean) => void
  showError?: boolean
}

export default function FleetInfoStep({ formData, updateFormData, onValidationChange, showError = false }: FleetInfoStepProps) {
  const [isFocused, setIsFocused] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const isValid: boolean = Boolean(formData.fleetSize && Number(formData.fleetSize) > 0)
    onValidationChange?.(isValid)
  }, [formData, onValidationChange])

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setIsFocused(false)
    updateFormData({ [name]: value })
    
    // Validate and notify parent component
    const isValid: boolean = Boolean(value && Number(value) > 0)
    onValidationChange?.(isValid)
    setIsSubmitted(true)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fleetSize">Fleet Size</Label>
        <Input
          id="fleetSize"
          name="fleetSize"
          type="number"
          placeholder={isFocused ? "Enter the number of vehicles in your fleet" : ""}
          value={formData.fleetSize}
          onChange={handleChange}
          min="1"
          className={showError && (!formData.fleetSize || Number(formData.fleetSize) <= 0) ? "border-red-500" : ""}
        />
        {showError && (!formData.fleetSize || Number(formData.fleetSize) <= 0) && (
          <p className="text-sm text-red-500">Please enter the total number of vehicles in your fleet.</p>
        )}
      </div>
    </div>
  )
}
