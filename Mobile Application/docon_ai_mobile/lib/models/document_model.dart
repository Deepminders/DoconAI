class DocumentModel {
  final String documentId;
  final String documentName;
  final String documentCategory;
  final String projectId;
  final String projectName;
  final int currentVersion;
  final DateTime uploadedDate;
  final DateTime lastModifiedDate;
  final String createdBy;
  final String? lastModifiedBy;
  final String documentLink;
  final String downloadLink;
  final List<DocumentVersion> versions;

  DocumentModel({
    required this.documentId,
    required this.documentName,
    required this.documentCategory,
    required this.projectId,
    required this.projectName,
    required this.currentVersion,
    required this.uploadedDate,
    required this.lastModifiedDate,
    required this.createdBy,
    this.lastModifiedBy,
    required this.documentLink,
    required this.downloadLink,
    required this.versions,
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    return DocumentModel(
      documentId: json['document_id']?.toString() ?? '',
      documentName: json['document_name']?.toString() ?? '',
      documentCategory: json['document_category']?.toString() ?? '',
      projectId: json['project_id']?.toString() ?? '',
      projectName: json['project_name']?.toString() ?? 'Unknown Project',
      currentVersion: json['current_version'] is int 
          ? json['current_version'] 
          : int.tryParse(json['current_version']?.toString() ?? '1') ?? 1,
      uploadedDate: _parseDate(json['upload_date']) ?? DateTime.now(),
      lastModifiedDate: _parseDate(json['last_modified_date']) ?? DateTime.now(),
      createdBy: json['created_by']?.toString() ?? '',
      lastModifiedBy: json['last_modified_by']?.toString(),
      documentLink: json['document_link']?.toString() ?? '',
      downloadLink: json['download_link']?.toString() ?? '',
      versions: (json['versions'] as List?)
              ?.map((v) => DocumentVersion.fromJson(v))
              .toList() ?? [],
    );
  }

  static DateTime? _parseDate(dynamic dateValue) {
    if (dateValue == null) return null;
    if (dateValue is DateTime) return dateValue;
    return DateTime.tryParse(dateValue.toString());
  }

  // Get file icon based on category or file type
  String get fileIcon {
    switch (documentCategory.toLowerCase()) {
      case 'bill of quantities (boq)':
        return '📊';
      case 'contracts and agreements':
        return '📝';
      case 'tender documents':
        return '📋';
      case 'progress reports':
        return '📈';
      case 'final reports':
        return '📑';
      case 'cost estimations':
        return '💰';
      case 'invoices and financials':
        return '🧾';
      case 'drawings and plans':
        return '📐';
      case 'permits and licenses':
        return '📜';
      case 'safety and compliance':
        return '🛡️';
      default:
        return '📄';
    }
  }

  // Get formatted file size from latest version
  String get formattedFileSize {
    if (versions.isEmpty) return 'Unknown size';
    final latestVersion = versions.last;
    final sizeInMB = latestVersion.documentSize / (1024 * 1024);
    if (sizeInMB < 1) {
      final sizeInKB = latestVersion.documentSize / 1024;
      return '${sizeInKB.toStringAsFixed(1)} KB';
    }
    return '${sizeInMB.toStringAsFixed(1)} MB';
  }

  // Get latest version info
  DocumentVersion get latestVersion => versions.isNotEmpty ? versions.last : versions.first;
}

class DocumentVersion {
  final int version;
  final String googleDriveId;
  final String originalFilename;
  final int documentSize;
  final DateTime uploadDate;
  final DateTime lastModifiedDate;
  final int pageCount;
  final String fileType;
  final String uploadedBy;
  final String documentLink;
  final String downloadLink;

  DocumentVersion({
    required this.version,
    required this.googleDriveId,
    required this.originalFilename,
    required this.documentSize,
    required this.uploadDate,
    required this.lastModifiedDate,
    required this.pageCount,
    required this.fileType,
    required this.uploadedBy,
    required this.documentLink,
    required this.downloadLink,
  });

  factory DocumentVersion.fromJson(Map<String, dynamic> json) {
    return DocumentVersion(
      version: json['version'] is int 
          ? json['version'] 
          : int.tryParse(json['version']?.toString() ?? '1') ?? 1,
      googleDriveId: json['google_drive_id']?.toString() ?? '',
      originalFilename: json['original_filename']?.toString() ?? '',
      documentSize: json['document_size'] is int 
          ? json['document_size'] 
          : int.tryParse(json['document_size']?.toString() ?? '0') ?? 0,
      uploadDate: DocumentModel._parseDate(json['upload_date']) ?? DateTime.now(),
      lastModifiedDate: DocumentModel._parseDate(json['last_modified_date']) ?? DateTime.now(),
      pageCount: json['page_count'] is int 
          ? json['page_count'] 
          : int.tryParse(json['page_count']?.toString() ?? '0') ?? 0,
      fileType: json['file_type']?.toString() ?? '',
      uploadedBy: json['uploaded_by']?.toString() ?? '',
      documentLink: json['document_link']?.toString() ?? '',
      downloadLink: json['download_link']?.toString() ?? '',
    );
  }
}