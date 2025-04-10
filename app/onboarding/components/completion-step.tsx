"use client"

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
import { motion } from "framer-motion"
import { CheckCircle2, Users, Truck, Factory, Battery, Building2, Coins, TableIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fleet Information */}
        <motion.div 
          className={cn(
            "group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Fleet Information</h4>
                <p className="text-muted-foreground">{formData.fleetSize} vehicles</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vehicle Types */}
        <motion.div 
          className={cn(
            "group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Vehicle Types</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.vehicleTypes.length > 0 ? (
                    formData.vehicleTypes.map((type, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {getDisplayName(type, vehicleTypeOptions)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No vehicle types selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vehicle Models */}
        <motion.div 
          className={cn(
            "group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Battery className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Vehicle Models</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.vehicleModels.length > 0 ? (
                    formData.vehicleModels.map((model, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {getDisplayName(model, vehicleModelOptions)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No vehicle models selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferred Manufacturers */}
        <motion.div 
          className={cn(
            "group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Preferred Manufacturers</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.preferredManufacturers.length > 0 ? (
                    formData.preferredManufacturers.map((manufacturer, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {getDisplayName(manufacturer, manufacturerOptions)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No manufacturers selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Energy Cost */}
        <motion.div 
          className={cn(
            "group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Energy Cost</h4>
                <p className="text-muted-foreground">
                  {formData.energyCost ? (
                    <span className="font-medium text-primary">${formData.energyCost}</span>
                  ) : (
                    "Not provided"
                  )} per kWh
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Department */}
        <motion.div 
          className={cn(
            "group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Department</h4>
                <p className="text-muted-foreground">
                  {formData.department || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {formData.csvData && formData.csvData.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <TableIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Vehicle Data Preview</h4>
              <p className="text-muted-foreground">
                Showing {formData.csvData.length} records from your uploaded data
              </p>
            </div>
          </div>

          <div className={cn(
            "rounded-xl border bg-card text-card-foreground shadow-sm",
            "dark:shadow-2xl dark:shadow-primary/5"
          )}>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[100px]">Vehicle ID</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[150px]">Vehicle Name</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[100px]">Latitude</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[100px]">Longitude</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[180px]">Date/Time</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 min-w-[200px]">Route URL</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[100px]">Charging</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[100px]">Speed (km/h)</TableHead>
                    <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-[100px]">Battery Level</TableHead>
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
                        <span className="hover:underline cursor-help" title={row.routeUrl}>
                          {row.routeUrl}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          row.vehicleCharging 
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                        )}>
                          {row.vehicleCharging ? 'Charging' : 'Not Charging'}
                        </span>
                      </TableCell>
                      <TableCell>{row.speedKmh}</TableCell>
                      <TableCell>
                        {row.batteryLevel !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  row.batteryLevel > 70 ? "bg-green-500" :
                                  row.batteryLevel > 30 ? "bg-yellow-500" :
                                  "bg-red-500"
                                )}
                                style={{ width: `${row.batteryLevel}%` }}
                              />
                            </div>
                            <span className="text-xs">{row.batteryLevel}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </motion.div>
      )}

      <div className="mt-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <p className="text-muted-foreground">
            Please review your information above and click &quot;Complete Onboarding&quot; when ready.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
