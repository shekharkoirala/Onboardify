"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { parse, isValid } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check } from "lucide-react"

interface CSVRow {
  [key: string]: string;
}

interface CSVUploadStepProps {
  formData: any
  updateFormData: (data: any) => void
  onValidationChange: (isValid: boolean) => void
  showError: boolean
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

export default function CSVUploadStep({
  formData,
  updateFormData,
  onValidationChange,
  showError,
}: CSVUploadStepProps) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [processedData, setProcessedData] = useState<ProcessedDataRow[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [schemaMapping, setSchemaMapping] = useState<SchemaMapping>({
    vehicleId: '',
    vehicleName: '',
    lat: '',
    lon: '',
    dateTime: '',
    routeUrl: '',
    vehicleCharging: '',
    speedKmh: '',
    batteryLevel: ''
  })
  const [showMapping, setShowMapping] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Papa.parse<CSVRow>(file, {
      header: true,
      complete: (results) => {
        if (results.data.length === 0 || !results.data[0]) {
          console.log('No data found in CSV')
          setShowMapping(true)
          return
        }

        const headers = Object.keys(results.data[0] as CSVRow)
        console.log('Detected CSV headers:', headers)
        setCsvHeaders(headers)
        setCsvData(results.data)

        // Try automatic mapping
        const mapping = autoMapColumns(headers)
        console.log('CSV Headers:', headers)
        console.log('Initial schema mapping:', mapping)
        console.log('Automatic mapping result:', mapping)
        
        setSchemaMapping(mapping)
        setShowMapping(true)

        // If mapping is valid, process data for preview
        if (isValidMapping(mapping)) {
          const processed = processDataInternal(results.data, mapping)
          setProcessedData(processed)
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
        setShowMapping(true)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const validateData = (data: ProcessedDataRow[]): string[] => {
    const errors: string[] = []
    
    data.forEach((row, index) => {
      // Validate Vehicle ID
      if (!row.vehicleId) {
        errors.push(`Row ${index + 1}: Vehicle ID is required`)
      }

      // Validate Vehicle Name
      if (!row.vehicleName) {
        errors.push(`Row ${index + 1}: Vehicle Name is required`)
      }

      // Validate Latitude
      if (isNaN(row.lat) || row.lat < -90 || row.lat > 90) {
        errors.push(`Row ${index + 1}: Invalid latitude value`)
      }

      // Validate Longitude
      if (isNaN(row.lon) || row.lon < -180 || row.lon > 180) {
        errors.push(`Row ${index + 1}: Invalid longitude value`)
      }

      // Validate DateTime
      if (!isValid(new Date(row.dateTime))) {
        errors.push(`Row ${index + 1}: Invalid date/time format`)
      }

      // Validate Route URL
      if (!row.routeUrl) {
        errors.push(`Row ${index + 1}: Route URL is required`)
      } else if (!row.routeUrl.startsWith('http')) {
        errors.push(`Row ${index + 1}: Invalid route URL format`)
      }

      // Validate Speed
      if (isNaN(row.speedKmh) || row.speedKmh < 0) {
        errors.push(`Row ${index + 1}: Invalid speed value`)
      }

      // Validate Battery Level (optional)
      if (row.batteryLevel !== null && (isNaN(row.batteryLevel) || row.batteryLevel < 0 || row.batteryLevel > 100)) {
        errors.push(`Row ${index + 1}: Invalid battery level (should be between 0 and 100)`)
      }
    })

    return errors
  }

  const autoMapColumns = (headers: string[]) => {
    const mapping: Partial<SchemaMapping> = {}
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase()
      
      // Vehicle ID mapping
      if (lowerHeader.includes('vehicle') && lowerHeader.includes('id')) {
        mapping.vehicleId = header
      }
      // Vehicle Name mapping
      else if (lowerHeader.includes('vehicle') && lowerHeader.includes('name')) {
        mapping.vehicleName = header
      }
      // Latitude mapping
      else if (lowerHeader === 'lat' || lowerHeader === 'latitude') {
        mapping.lat = header
      }
      // Longitude mapping
      else if (lowerHeader === 'lon' || lowerHeader === 'longitude') {
        mapping.lon = header
      }
      // DateTime mapping
      else if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
        mapping.dateTime = header
      }
      // Route URL mapping
      else if (lowerHeader.includes('route') && lowerHeader.includes('url')) {
        mapping.routeUrl = header
      }
      // Vehicle Charging mapping
      else if (lowerHeader.includes('charging')) {
        mapping.vehicleCharging = header
      }
      // Speed mapping
      else if (lowerHeader.includes('speed')) {
        mapping.speedKmh = header
      }
      // Battery Level mapping
      else if (lowerHeader.includes('battery') && lowerHeader.includes('level')) {
        mapping.batteryLevel = header
      }
    })
    return mapping as SchemaMapping
  }

  const isValidMapping = (mapping: SchemaMapping) => {
    const requiredFields = ['vehicleId', 'vehicleName', 'lat', 'lon', 'dateTime', 'routeUrl']
    return requiredFields.every(field => {
      const value = mapping[field as keyof SchemaMapping]
      return value !== undefined && value !== ''
    })
  }

  const detectDateFormat = (dateString: string) => {
    const formats = [
      'yyyy-MM-dd HH:mm:ss',
      'MM/dd/yyyy HH:mm:ss',
      'dd/MM/yyyy HH:mm:ss',
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy'
    ]

    for (const format of formats) {
      const parsed = parse(dateString, format, new Date())
      if (isValid(parsed)) {
        return format
      }
    }
    return null
  }

  const processDataInternal = (data: CSVRow[], mapping: SchemaMapping): ProcessedDataRow[] => {
    const processed = data.map(row => {
      const batteryLevel = row[mapping.batteryLevel] ? parseFloat(row[mapping.batteryLevel]) : null

      return {
        vehicleId: row[mapping.vehicleId],
        vehicleName: row[mapping.vehicleName],
        lat: parseFloat(row[mapping.lat]),
        lon: parseFloat(row[mapping.lon]),
        dateTime: row[mapping.dateTime],
        routeUrl: row[mapping.routeUrl],
        vehicleCharging: row[mapping.vehicleCharging]?.toLowerCase() === 'yes' || 
                        row[mapping.vehicleCharging]?.toLowerCase() === 'true' || 
                        (batteryLevel !== null && batteryLevel > 0),
        speedKmh: parseFloat(row[mapping.speedKmh]) || 0,
        batteryLevel: batteryLevel
      }
    })

    const errors = validateData(processed)
    setValidationErrors(errors)
    return processed
  }

  const handleMappingChange = (field: keyof SchemaMapping, value: string) => {
    console.log('Mapping change:', field, value)
    setSchemaMapping(prev => {
      const newMapping = {
        ...prev,
        [field]: value
      }
      console.log('New schema mapping:', newMapping)

      // Update preview if mapping is valid
      if (isValidMapping(newMapping)) {
        const processed = processDataInternal(csvData, newMapping)
        setProcessedData(processed)
      }

      return newMapping
    })
  }

  const handleMappingComplete = () => {
    if (isValidMapping(schemaMapping)) {
      setShowPreview(true)
    }
  }

  const handleConfirm = () => {
    updateFormData({ csvData: processedData, schemaMapping })
    onValidationChange(true)
    setShowMapping(false)
    setShowPreview(false)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
          ${showError ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <div>
            {formData.csvData ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <p>CSV file uploaded successfully</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.csvData.length} rows processed
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFormData({ csvData: null });
                    onValidationChange(false);
                  }}
                >
                  Upload a different file
                </Button>
              </div>
            ) : (
              <p>Drag and drop a CSV file here, or click to select one</p>
            )}
          </div>
        )}
      </div>

      <Dialog open={showMapping} onOpenChange={setShowMapping}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Map CSV Columns</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please map your CSV columns to the required fields.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6">
              {/* Mapping Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(schemaMapping).map(([field, value]) => {
                  const isRequired = !['vehicleCharging', 'batteryLevel'].includes(field)
                  const isMapped = !!value
                  return (
                    <div key={field} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium flex-shrink-0">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                          {isRequired && <span className="text-red-500">*</span>}:
                        </label>
                        {!isMapped && isRequired && (
                          <span className="text-xs text-red-500">Required</span>
                        )}
                      </div>
                      <Select
                        value={value || undefined}
                        onValueChange={(newValue) => handleMappingChange(field as keyof SchemaMapping, newValue)}
                      >
                        <SelectTrigger className={`w-full ${!isMapped && isRequired ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {csvHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 border border-red-200 rounded-md bg-red-50">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Validation Errors:</h4>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowMapping(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidMapping(schemaMapping) || validationErrors.length > 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showError && !formData.csvData && (
        <p className="text-red-500">Please upload a CSV file</p>
      )}
    </div>
  )
}