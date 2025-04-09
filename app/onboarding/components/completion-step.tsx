import { Check } from "lucide-react"

interface CompletionStepProps {
  formData: {
    fleetSize: string
    vehicleTypes: string[]
    vehicleModels: string[]
    preferredManufacturers: string[]
    energyCost: string
    department: string
  }
}

export default function CompletionStep({ formData }: CompletionStepProps) {
  const getDisplayName = (value: string, options: { label: string; value: string }[]) => {
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-red-100 rounded-full p-3">
          <Check className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <h3 className="text-lg font-medium text-center mb-6 text-red-700">Thank you for completing the onboarding!</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">Fleet Information</h4>
            <p className="text-red-600">Fleet Size: {formData.fleetSize} vehicles</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">Vehicle Types</h4>
            <ul className="list-disc list-inside text-red-600">
              {formData.vehicleTypes.length > 0 ? (
                formData.vehicleTypes.map((type, index) => (
                  <li key={index}>{getDisplayName(type, vehicleTypeOptions)}</li>
                ))
              ) : (
                <li className="text-red-400">No vehicle types selected</li>
              )}
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">Vehicle Models</h4>
            <ul className="list-disc list-inside text-red-600">
              {formData.vehicleModels.length > 0 ? (
                formData.vehicleModels.map((model, index) => (
                  <li key={index}>{getDisplayName(model, vehicleModelOptions)}</li>
                ))
              ) : (
                <li className="text-red-400">No vehicle models selected</li>
              )}
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">Preferred Manufacturers</h4>
            <ul className="list-disc list-inside text-red-600">
              {formData.preferredManufacturers.length > 0 ? (
                formData.preferredManufacturers.map((manufacturer, index) => (
                  <li key={index}>{getDisplayName(manufacturer, manufacturerOptions)}</li>
                ))
              ) : (
                <li className="text-red-400">No manufacturers selected</li>
              )}
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">Energy Cost</h4>
            <p className="text-red-600">{formData.energyCost ? `$${formData.energyCost} per kWh` : "Not provided"}</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">Department</h4>
            <p className="text-red-600">{formData.department || "Not provided"}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-red-600 mt-6">Our team will review your information and contact you shortly.</p>
    </div>
  )
}
