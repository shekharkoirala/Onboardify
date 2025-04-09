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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  vehicleCharging?: string
}

export default function CSVUploadStep({
  formData,
  updateFormData,
  onValidationChange,
  showError,
}: CSVUploadStepProps) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<any[]>([])
  const [schemaMapping, setSchemaMapping] = useState<SchemaMapping>({
    vehicleId: '',
    vehicleName: '',
    lat: '',
    lon: '',
    dateTime: '',
    routeUrl: '',
    vehicleCharging: ''
  })
  const [showMapping, setShowMapping] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Papa.parse<CSVRow>(file, {
      header: true,
      complete: (results) => {
        if (results.data.length === 0 || !results.data[0]) {
          setShowMapping(true)
          return
        }

        const headers = Object.keys(results.data[0] as CSVRow)
        setCsvHeaders(headers)
        setCsvData(results.data)

        // Try automatic mapping
        const mapping = autoMapColumns(headers)
        console.log('Automatic mapping result:', mapping)
        
        // Show mapping dialog if any required field is missing
        if (!isValidMapping(mapping)) {
          console.log('Invalid mapping - missing required fields')
          setSchemaMapping(mapping) // Keep partial mapping
          setShowMapping(true)
        } else {
          console.log('Valid mapping found')
          setSchemaMapping(mapping)
          processData(results.data, mapping)
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
        setShowMapping(true)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

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
      else if (lowerHeader.includes('lat') || lowerHeader === 'latitude') {
        mapping.lat = header
      }
      // Longitude mapping
      else if (lowerHeader.includes('lon') || lowerHeader === 'longitude') {
        mapping.lon = header
      }
      // DateTime mapping
      else if (lowerHeader.includes('date') || lowerHeader.includes('time') || lowerHeader.includes('timestamp')) {
        mapping.dateTime = header
      }
      // Route URL mapping
      else if (lowerHeader.includes('route') || lowerHeader.includes('url')) {
        mapping.routeUrl = header
      }
      // Optional: Vehicle Charging mapping
      else if (lowerHeader.includes('charging')) {
        mapping.vehicleCharging = header
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

  const processData = (data: CSVRow[], mapping: SchemaMapping) => {
    const processedData = data.map(row => ({
      vehicleId: row[mapping.vehicleId],
      vehicleName: row[mapping.vehicleName],
      lat: parseFloat(row[mapping.lat]),
      lon: parseFloat(row[mapping.lon]),
      dateTime: row[mapping.dateTime],
      routeUrl: row[mapping.routeUrl],
      vehicleCharging: mapping.vehicleCharging ? row[mapping.vehicleCharging]?.toLowerCase() === 'true' : false
    }))

    updateFormData({ csvData: processedData, schemaMapping: mapping })
    onValidationChange(true)
  }

  const handleMappingChange = (field: keyof SchemaMapping, value: string) => {
    setSchemaMapping(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMappingComplete = () => {
    if (isValidMapping(schemaMapping)) {
      processData(csvData, schemaMapping)
      setShowMapping(false)
    }
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
          <p>Drag and drop a CSV file here, or click to select one</p>
        )}
      </div>

      <Dialog open={showMapping} onOpenChange={setShowMapping}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Map CSV Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please map your CSV columns to the required fields. All fields except Vehicle Charging are required.
            </p>
            {Object.entries(schemaMapping).map(([field, value]) => {
              const isRequired = field !== 'vehicleCharging'
              const isMapped = !!value
              return (
                <div key={field} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
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
                    <SelectTrigger className={`w-[200px] ${!isMapped && isRequired ? 'border-red-500' : ''}`}>
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
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowMapping(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMappingComplete}
              disabled={!isValidMapping(schemaMapping)}
            >
              Apply Mapping
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showError && !formData.csvData && (
        <p className="text-red-500">Please upload a CSV file</p>
      )}
    </div>
  )
}