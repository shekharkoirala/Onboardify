import { Check } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface CompletionStepProps {
  formData: {
    fleetSize: string
    vehicleTypes: string[]
    vehicleModels: string[]
    preferredManufacturers: string[]
    energyCost: string
    department: string
    csvData?: ProcessedDataRow[]
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
        <div className="bg-green-100 rounded-full p-3">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <h3 className="text-lg font-medium text-center mb-6 text-green-700">Thank you for completing the onboarding!</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Fleet Information</h4>
            <p className="text-green-600">Fleet Size: {formData.fleetSize} vehicles</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Vehicle Types</h4>
            <ul className="list-disc list-inside text-green-600">
              {formData.vehicleTypes.length > 0 ? (
                formData.vehicleTypes.map((type, index) => (
                  <li key={index}>{getDisplayName(type, vehicleTypeOptions)}</li>
                ))
              ) : (
                <li className="text-green-400">No vehicle types selected</li>
              )}
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Vehicle Models</h4>
            <ul className="list-disc list-inside text-green-600">
              {formData.vehicleModels.length > 0 ? (
                formData.vehicleModels.map((model, index) => (
                  <li key={index}>{getDisplayName(model, vehicleModelOptions)}</li>
                ))
              ) : (
                <li className="text-green-400">No vehicle models selected</li>
              )}
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Preferred Manufacturers</h4>
            <ul className="list-disc list-inside text-green-600">
              {formData.preferredManufacturers.length > 0 ? (
                formData.preferredManufacturers.map((manufacturer, index) => (
                  <li key={index}>{getDisplayName(manufacturer, manufacturerOptions)}</li>
                ))
              ) : (
                <li className="text-green-400">No manufacturers selected</li>
              )}
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Energy Cost</h4>
            <p className="text-green-600">{formData.energyCost ? `$${formData.energyCost} per kWh` : "Not provided"}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Department</h4>
            <p className="text-green-600">{formData.department || "Not provided"}</p>
          </div>
        </div>

        {formData.csvData && formData.csvData.length > 0 && (
          <div className="mt-8">
            <h4 className="font-medium text-green-700 mb-4">Uploaded Vehicle Data</h4>
            <div className="rounded-md border">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Vehicle ID</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[150px]">Vehicle Name</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Latitude</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Longitude</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[180px]">Date/Time</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 min-w-[200px]">Route URL</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Charging</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Speed (km/h)</TableHead>
                      <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Battery Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.csvData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.vehicleId}</TableCell>
                        <TableCell>{row.vehicleName}</TableCell>
                        <TableCell>{row.lat.toFixed(4)}</TableCell>
                        <TableCell>{row.lon.toFixed(4)}</TableCell>
                        <TableCell>{new Date(row.dateTime).toLocaleString()}</TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          <span title={row.routeUrl}>{row.routeUrl}</span>
                        </TableCell>
                        <TableCell>{row.vehicleCharging ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{row.speedKmh}</TableCell>
                        <TableCell>{row.batteryLevel !== null ? `${row.batteryLevel}%` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total rows: {formData.csvData.length}
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-green-600 mt-6">Our team will review your information and contact you shortly.</p>
    </div>
  )
}
