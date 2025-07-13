import { useState, useEffect, useRef } from 'react'
import { Save, RefreshCw, Calendar, FileText, Hash, Loader2, FolderOpen, Tag, Upload, X, File } from 'lucide-react'
import { useNotifications } from '../Common/NotificationSystem'

const UpdateDocument = ({ selectedDocument, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    document_name: '',
    document_id: '',
    document_category: '',
    modified_date: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [updateMode, setUpdateMode] = useState('info') // 'info' or 'replace'
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [replaceStep, setReplaceStep] = useState('initial') // 'initial', 'classifying', 'confirming'
  const [classificationData, setClassificationData] = useState(null)
  const [confirmedCategory, setConfirmedCategory] = useState('')
  const fileInputRef = useRef(null)

  // Initialize notification system
  const notify = useNotifications()

  // Document categories
  const documentCategories = [
    { value: '', label: 'Select a category', disabled: true },
    { value: 'Bill of Quantities (BOQ)', label: 'Bill of Quantities (BOQ)' },
    { value: 'Contracts and Agreements', label: 'Contracts and Agreements' },
    { value: 'Tender Documents', label: 'Tender Documents' },
    { value: 'Progress Reports', label: 'Progress Reports' },
    { value: 'Final Reports', label: 'Final Reports' },
    { value: 'Cost Estimations', label: 'Cost Estimations' },
    { value: 'Invoices and Financials', label: 'Invoices and Financials' },
    { value: 'Drawings and Plans', label: 'Drawings and Plans' },
    { value: 'Permits and Licenses', label: 'Permits and Licenses' },
    { value: 'Safety and Compliance', label: 'Safety and Compliance' },
    { value: 'Other', label: 'Other' }
  ]

  // Initialize form data when selectedDocument changes
  useEffect(() => {
    const initialData = {
      document_name: selectedDocument?.document_name || '',
      document_id: selectedDocument?.document_id || '',
      document_category: selectedDocument?.document_category || '',
      modified_date: new Date().toISOString().split('T')[0]
    }
    setFormData(initialData)
    setHasChanges(false)
    setSelectedFile(null)
    setUpdateMode('info')
    setReplaceStep('initial')
    setClassificationData(null)
    setConfirmedCategory('')
    
    if (selectedDocument?.document_name) {
      notify.info(`Loaded "${selectedDocument.document_name}" for editing`, {
        title: 'Document Loaded',
        duration: 3000
      })
    }
  }, [selectedDocument])

  // Check for changes based on update mode
  useEffect(() => {
    if (selectedDocument) {
      if (updateMode === 'replace') {
        // For replace mode, check if file is selected and classification is done
        setHasChanges(selectedFile !== null && replaceStep === 'confirming')
      } else {
        // For info mode, check all fields except file
        const hasChanges = 
          formData.document_name !== selectedDocument.document_name ||
          formData.document_category !== (selectedDocument.document_category || '') ||
          formData.modified_date !== new Date().toISOString().split('T')[0]
        setHasChanges(hasChanges)
      }
    }
  }, [formData, selectedDocument, updateMode, selectedFile, replaceStep])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleModeChange = (mode) => {
    setUpdateMode(mode)
    setSelectedFile(null)
    setReplaceStep('initial')
    setClassificationData(null)
    setConfirmedCategory('')
    
    // Reset form to original values when switching modes
    if (selectedDocument) {
      setFormData({
        document_name: selectedDocument.document_name || '',
        document_id: selectedDocument.document_id || '',
        document_category: selectedDocument.document_category || '',
        modified_date: new Date().toISOString().split('T')[0]
      })
    }
    
    notify.info(`Switched to ${mode === 'info' ? 'Update Info' : 'Replace Document'} mode`, {
      duration: 2000
    })
  }

  // File handling functions
  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type (adjust as needed)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      if (!allowedTypes.includes(file.type)) {
        notify.warning('Please select a valid document file (PDF, DOC, DOCX, XLS, XLSX)', {
          title: 'Invalid File Type',
          duration: 4000
        })
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        notify.warning('File size must be less than 10MB', {
          title: 'File Too Large',
          duration: 4000
        })
        return
      }

      setSelectedFile(file)
      setReplaceStep('initial')
      setClassificationData(null)
      setConfirmedCategory('')
      notify.success(`Selected file: ${file.name}`, {
        title: 'File Selected',
        duration: 3000
      })
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setReplaceStep('initial')
    setClassificationData(null)
    setConfirmedCategory('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    notify.info('File selection cleared', { duration: 2000 })
  }

  // Handle classification for replace mode
  const handleClassifyReplacement = async () => {
    if (!selectedFile) {
      notify.warning('Please select a file first.', { title: 'No File' })
      return
    }

    setIsLoading(true)
    setReplaceStep('classifying')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/doc/classify', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Document classification failed')
      }

      const data = await response.json()
      setClassificationData(data)
      setConfirmedCategory(data.predicted_category)
      setReplaceStep('confirming')
      
      notify.info('Please confirm the document category for replacement.', {
        title: 'Classification Complete',
        duration: 4000
      })
    } catch (error) {
      console.error('Error during classification:', error)
      setReplaceStep('initial')
      notify.error('Could not classify the document. Please try again.', {
        title: 'Classification Error',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.document_name.trim()) {
      notify.warning('Document name is required', {
        title: 'Validation Error',
        duration: 4000
      })
      return false
    }
    
    if (formData.document_name.trim().length < 3) {
      notify.warning('Document name must be at least 3 characters long', {
        title: 'Validation Error',
        duration: 4000
      })
      return false
    }

    if (updateMode === 'info') {
      if (!formData.document_category) {
        notify.warning('Please select a document category', {
          title: 'Validation Error',
          duration: 4000
        })
        return false
      }
      
      if (!formData.modified_date) {
        notify.warning('Modified date is required', {
          title: 'Validation Error',
          duration: 4000
        })
        return false
      }
    } else if (updateMode === 'replace') {
      if (!selectedFile) {
        notify.warning('Please select a file to replace the document', {
          title: 'Validation Error',
          duration: 4000
        })
        return false
      }

      if (replaceStep !== 'confirming') {
        notify.warning('Please classify the document first', {
          title: 'Validation Error',
          duration: 4000
        })
        return false
      }

      if (!confirmedCategory) {
        notify.warning('Please confirm the document category', {
          title: 'Validation Error',
          duration: 4000
        })
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (!hasChanges) {
      notify.info('No changes to save', {
        title: 'Nothing to Update',
        duration: 3000
      })
      return
    }
    
    setIsSaving(true)

    try {
      notify.info(`${updateMode === 'replace' ? 'Replacing document file' : 'Saving document changes'}...`, {
        title: 'Processing',
        duration: 2000
      })

      const submitFormData = new FormData()
      let apiUrl = ''
      
      if (updateMode === 'replace') {
        // For replace mode: PUT /update/{doc_id}/file
        submitFormData.append('file', selectedFile)
        submitFormData.append('confirmed_category', confirmedCategory)
        
        // Only send new_name if it's different from original
        if (formData.document_name.trim() !== selectedDocument.document_name) {
          submitFormData.append('new_name', formData.document_name.trim())
        }
        
        apiUrl = `http://127.0.0.1:8000/api/doc/update/${formData.document_id}/file`
        
      } else {
        // For info mode: PUT /update/{docid}
        // Only send new_name if it's different from original
        if (formData.document_name.trim() !== selectedDocument.document_name) {
          submitFormData.append('new_name', formData.document_name.trim())
        }
        
        // Only send new_category if it's different from original
        if (formData.document_category !== (selectedDocument.document_category || '')) {
          submitFormData.append('new_category', formData.document_category)
        }
        
        apiUrl = `http://127.0.0.1:8000/api/doc/update/${formData.document_id}`
      }

      // Make the API call
      const response = await fetch(apiUrl, {
        method: 'PUT',
        body: submitFormData
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`
        
        try {
          const errorData = await response.json()
          
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (typeof errorData.detail === 'object') {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map(err => err.msg).join(', ')
            } else {
              errorMessage = errorData.detail.message || 
                            JSON.stringify(errorData.detail) || 
                            errorMessage
            }
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError)
        }
        
        throw new Error(errorMessage)
      }

      // Parse successful response
      const responseData = await response.json()
      
      setHasChanges(false)
      setSelectedFile(null)
      setReplaceStep('initial')
      setClassificationData(null)
      setConfirmedCategory('')
      
      // Show success notification based on mode
      if (updateMode === 'replace') {
        notify.success(`Document file replaced successfully!`, {
          title: 'File Replaced',
          message: `Category: ${confirmedCategory}${formData.document_name !== selectedDocument.document_name ? ` | Name updated to: "${formData.document_name}"` : ''}`,
          duration: 5000,
          action: {
            label: 'View Document',
            onClick: () => {
              if (selectedDocument?.document_link) {
                window.open(selectedDocument.document_link, '_blank')
              }
            }
          }
        })
      } else {
        const categoryLabel = documentCategories.find(cat => cat.value === formData.document_category)?.label
        notify.success(`Document updated successfully!`, {
          title: 'Update Successful',
          message: categoryLabel ? `Category: ${categoryLabel}` : undefined,
          duration: 4000,
          action: {
            label: 'View Document',
            onClick: () => {
              if (selectedDocument?.document_link) {
                window.open(selectedDocument.document_link, '_blank')
              }
            }
          }
        })
      }
      
      // Call onUpdate to refresh the documents list
      if (onUpdate) {
        onUpdate()
      }

      // Auto-close sidebar after successful update
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error updating document:', error)
      
      // Error notification with retry option
      notify.error(error.message || 'Failed to update document. Please check your connection and try again.', {
        title: updateMode === 'replace' ? 'File Replace Failed' : 'Update Failed',
        duration: 7000,
        action: {
          label: 'Retry',
          onClick: () => handleSubmit(e)
        }
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (selectedDocument) {
      setFormData({
        document_name: selectedDocument.document_name || '',
        document_id: selectedDocument.document_id || '',
        document_category: selectedDocument.document_category || '',
        modified_date: new Date().toISOString().split('T')[0]
      })
      setSelectedFile(null)
      setReplaceStep('initial')
      setClassificationData(null)
      setConfirmedCategory('')
      setHasChanges(false)
      
      notify.info('Form reset to original values', {
        title: 'Form Reset',
        duration: 3000
      })
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      notify.warning('You have unsaved changes. Are you sure you want to close?', {
        title: 'Unsaved Changes',
        duration: 6000,
        action: {
          label: 'Yes, Close',
          onClick: () => {
            onClose()
            notify.info('Changes discarded', { duration: 2000 })
          }
        }
      })
    } else {
      onClose()
    }
  }

  if (!selectedDocument) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading document information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Update Mode</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleModeChange('info')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              updateMode === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Update Info
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('replace')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              updateMode === 'replace'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Replace Document
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {updateMode === 'info' 
            ? 'Update document name, category, and other metadata'
            : 'Replace the document file with a new one (includes auto-categorization)'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Name Field - Always visible */}
        <div className="space-y-2">
          <label htmlFor="document_name" className="flex items-center text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Document Name
            {hasChanges && <span className="ml-1 text-orange-500">*</span>}
          </label>
          <input
            type="text"
            id="document_name"
            name="document_name"
            value={formData.document_name || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter document name"
            required
            minLength={3}
          />
          <p className="text-xs text-gray-500">Minimum 3 characters required</p>
        </div>

        {/* File Upload - Only for replace mode */}
        {updateMode === 'replace' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Upload className="h-4 w-4 mr-2 text-blue-600" />
                Replace Document File
                {hasChanges && <span className="ml-1 text-orange-500">*</span>}
              </label>
              
              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="h-8 w-8 mx-auto text-green-600" />
                    <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop a file here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
              />
            </div>

            {/* Classification Step for Replace Mode */}
            {selectedFile && replaceStep === 'initial' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  Please classify the document to determine its category before replacement.
                </p>
                <button
                  type="button"
                  onClick={handleClassifyReplacement}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Classifying...
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 mr-2" />
                      Classify Document
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Classification Loading State */}
            {selectedFile && replaceStep === 'classifying' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Analyzing Document...</p>
                    <p className="text-xs text-yellow-600">This may take a few seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Confirmation for Replace Mode */}
            {selectedFile && replaceStep === 'confirming' && classificationData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Confirm Category</h4>
                <p className="text-xs text-green-700 mb-3">
                  Predicted Category: <span className="font-bold">{classificationData.predicted_category}</span>
                </p>
                <select
                  value={confirmedCategory}
                  onChange={(e) => setConfirmedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  required
                >
                  {documentCategories.map((category) => (
                    <option 
                      key={category.value} 
                      value={category.value}
                      disabled={category.disabled}
                      className={category.disabled ? 'text-gray-400' : ''}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-green-600 mt-2">
                  You can modify the predicted category if needed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Document Category Field - Only for info mode */}
        {updateMode === 'info' && (
          <div className="space-y-2">
            <label htmlFor="document_category" className="flex items-center text-sm font-medium text-gray-700">
              <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
              Document Category
              {hasChanges && <span className="ml-1 text-orange-500">*</span>}
            </label>
            <div className="relative">
              <select
                id="document_category"
                name="document_category"
                value={formData.document_category || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                required
              >
                {documentCategories.map((category) => (
                  <option 
                    key={category.value} 
                    value={category.value}
                    disabled={category.disabled}
                    className={category.disabled ? 'text-gray-400' : ''}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">Select the most appropriate category for this document</p>
          </div>
        )}

        {/* Document ID Field (Read-only) */}
        <div className="space-y-2">
          <label htmlFor="document_id" className="flex items-center text-sm font-medium text-gray-700">
            <Hash className="h-4 w-4 mr-2 text-blue-600" />
            Document ID
          </label>
          <input
            type="text"
            id="document_id"
            name="document_id"
            value={formData.document_id || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            placeholder="Document ID"
          />
          <p className="text-xs text-gray-500">Document ID cannot be modified</p>
        </div>

        {/* Modified Date Field - Only for info mode */}
        {updateMode === 'info' && (
          <div className="space-y-2">
            <label htmlFor="modified_date" className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Modified Date
              {hasChanges && <span className="ml-1 text-orange-500">*</span>}
            </label>
            <input
              type="date"
              id="modified_date"
              name="modified_date"
              value={formData.modified_date || new Date().toISOString().split('T')[0]}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-500">Cannot be set to a future date</p>
          </div>
        )}

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-800">
                  You have unsaved changes
                  {updateMode === 'replace' && selectedFile && ` - File: ${selectedFile.name} | Category: ${confirmedCategory}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {updateMode === 'replace' ? 'Replacing...' : 'Saving...'}
              </>
            ) : (
              <>
                {updateMode === 'replace' ? <Upload className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {updateMode === 'replace' ? 'Replace Document' : 'Save Changes'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving || !hasChanges}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="w-full bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Cancel
        </button>
      </form>

      {/* Document Information Card */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Original Document Info</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Name:</span> {selectedDocument.document_name}</p>
          <p><span className="font-medium">ID:</span> {selectedDocument.document_id}</p>
          <p><span className="font-medium">Category:</span> {
            selectedDocument.document_category 
              ? documentCategories.find(cat => cat.value === selectedDocument.document_category)?.label || selectedDocument.document_category
              : 'Not categorized'
          }</p>
          {selectedDocument.created_date && (
            <p><span className="font-medium">Created:</span> {new Date(selectedDocument.created_date).toLocaleDateString()}</p>
          )}
          {selectedDocument.document_link && (
            <p><span className="font-medium">Status:</span> <span className="text-green-600">Available</span></p>
          )}
        </div>
      </div>

      {/* Mode Information */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          {updateMode === 'info' ? 'Update Information' : 'Replace Document'}
        </h3>
        <p className="text-xs text-blue-700">
          {updateMode === 'info' 
            ? 'Modify the document name, category, and other metadata without changing the file.'
            : 'Upload a new file to replace the existing document. The system will automatically classify the new document and ask for confirmation.'
          }
        </p>
      </div>
    </div>
  )
}

export default UpdateDocument