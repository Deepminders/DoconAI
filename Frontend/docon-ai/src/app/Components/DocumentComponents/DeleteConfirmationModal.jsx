import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Loader2, FileText, Calendar, Hash } from 'lucide-react';

const DeleteConfirmationModal = ({ document, isOpen, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const expectedConfirmText = document ? `DELETE ${document.document_name}` : '';

  useEffect(() => {
    setIsConfirmed(confirmText === expectedConfirmText);
  }, [confirmText, expectedConfirmText]);

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setIsConfirmed(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!isConfirmed || !document) {
      alert('Please type the confirmation text exactly as shown.');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/doc/delete/${document.document_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      alert(`Document "${document.document_name}" has been permanently deleted.`);

      if (onDelete) {
        onDelete(document.document_id);
      }

      handleClose();

    } catch (error) {
      console.error('Error deleting document:', error);
      alert(error.message || 'Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setIsConfirmed(false);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isConfirmed && !isDeleting) {
      handleDelete();
    }
  };

  const handleInputChange = (e) => {
    setConfirmText(e.target.value);
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-red-800">
                  Permanent Deletion Warning
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete the document and all its versions from both the database and Google Drive. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Document Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-20">Name:</span>
                <span className="text-gray-900 break-all">{document.document_name}</span>
              </div>
              <div className="flex items-center">
                <Hash className="w-3 h-3 mr-1 text-gray-500" />
                <span className="font-medium text-gray-700 w-16">ID:</span>
                <span className="text-gray-900">{document.document_id}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-20">Category:</span>
                <span className="text-gray-900">{document.document_category || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                <span className="font-medium text-gray-700 w-16">Modified:</span>
                <span className="text-gray-900">
                  {new Date(document.last_modified_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-20">Versions:</span>
                <span className="text-gray-900">{document.versions?.length || 1}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type the following text to confirm deletion:
              </label>
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                <code className="text-sm font-mono text-gray-800 break-all">
                  {expectedConfirmText}
                </code>
              </div>
            </div>
            
            <div>
              <input
                type="text"
                value={confirmText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type the confirmation text here"
                disabled={isDeleting}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  isConfirmed 
                    ? 'border-green-500 focus:ring-green-500 bg-green-50' 
                    : 'border-gray-300 focus:ring-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {confirmText && (
                <p className={`text-xs mt-1 ${isConfirmed ? 'text-green-600' : 'text-red-600'}`}>
                  {isConfirmed ? '✓ Confirmation text matches' : '✗ Confirmation text does not match'}
                </p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              What will be deleted:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Document record from the database</li>
              <li>• All {document.versions?.length || 1} version(s) of the file</li>
              <li>• Files from Google Drive storage</li>
              <li>• All associated metadata and history</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 w-4 mr-2" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;