import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class AuthService {
  // Change this based on your setup:
  // For Android Emulator: use 'http://10.0.2.2:8000'
  // For iOS Simulator: use 'http://localhost:8000'
  // For Physical Device: use 'http://YOUR_COMPUTER_IP:8000'
  static const String baseUrl = 'http://10.0.2.2:8000';

  // Store token locally (in a real app, use secure storage)
  static String? _currentToken;

  // Login API call
  static Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/user/login'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          'username': username,
          'password': password,
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        // Store the token
        _currentToken = data['access_token'];

        return {
          'success': true,
          'data': data,
          'token': data['access_token'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Login failed',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get current user info from token
  static Future<Map<String, dynamic>> getCurrentUser() async {
    if (_currentToken == null) {
      return {
        'success': false,
        'message': 'No token found. Please login again.',
      };
    }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/decode-token?token=$_currentToken'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'user': data,
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to get user info',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Signup API call
  static Future<Map<String, dynamic>> signup({
    required String companyName,
    required String firstName,
    required String lastName,
    required String username,
    required String userRole,
    required String email,
    required String phoneNumber,
    required String password,
    required String gender,
  }) async {
    try {
      final userData = {
        'company_name': companyName,
        'first_name': firstName,
        'last_name': lastName,
        'username': username,
        'user_role': userRole,
        'gender': gender,
        'email': email,
        'phone_number': phoneNumber,
        'password': password,
      };

      final response = await http.post(
        Uri.parse('$baseUrl/user/adduser'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(userData),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': data,
          'message': 'Signup successful!',
        };
      } else {
        return {
          'success': false,
          'message': data['Error'] ?? 'Signup failed',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get user projects
  static Future<Map<String, dynamic>> getUserProjects(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/staff/user/$userId/projects'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'projects': data['projects'] ?? [],
          'count': data['count'] ?? 0,
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to fetch projects',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get document count for user
  static Future<Map<String, dynamic>> getDocumentCount(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/doc/user/$userId/documents'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'documents': data['recent_documents'] ?? [],
          'count': data['count'] ?? 0,
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to fetch documents',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get project documents (from assigned projects)
  static Future<Map<String, dynamic>> getProjectDocuments(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/doc/user/$userId/project-documents'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'documents': data['recent_documents'] ?? [],
          'count': data['count'] ?? 0,
          'access_level': data['access_level'] ?? '',
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to fetch project documents',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get user uploaded documents
  static Future<Map<String, dynamic>> getUserDocuments(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/doc/user/$userId/documents'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'documents': data['recent_documents'] ?? [],
          'count': data['count'] ?? 0,
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to fetch user documents',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Document Classification and Upload Functions

  // Step 1: Classify document (matches web classify endpoint)
  static Future<Map<String, dynamic>> classifyDocument(String filePath) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/doc/classify'),
      );
      
      // Add the file
      request.files.add(await http.MultipartFile.fromPath('file', filePath));

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      final data = json.decode(responseBody);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'message': data['message'],
          'predicted_category': data['predicted_category'],
          'original_filename': data['original_filename'],
          'temp_file_path': data['temp_file_path'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to classify document',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Step 2: Upload document after classification (matches web upload endpoint)
  static Future<Map<String, dynamic>> uploadDocument({
    required String projectId,
    required String documentName,
    required String confirmedCategory,
    required String tempFilePath,
    required String originalFilename,
    required String userId,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/doc/upload'),
      );
      
      // Add form fields (matching the web implementation)
      request.fields.addAll({
        'proj_id': projectId,
        'doc_name': documentName,
        'confirmed_category': confirmedCategory,
        'temp_file_path': tempFilePath,
        'original_filename': originalFilename,
        'user_id': userId,
      });

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      final data = json.decode(responseBody);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'message': data['message'],
          'document_id': data['document_id'],
          'drive_id': data['drive_id'],
          'version': data['version'],
          'created_by': data['created_by'],
          'links': data['links'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to upload document',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Update document file (replace existing document with new version)
  static Future<Map<String, dynamic>> updateDocumentFile({
    required String documentId,
    required String filePath,
    String? newName,
    required String confirmedCategory,
    required String userId,
  }) async {
    try {
      var request = http.MultipartRequest(
        'PUT',
        Uri.parse('$baseUrl/api/doc/update/$documentId/file'),
      );
      
      // Add the file
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
      
      // Add form fields
      request.fields.addAll({
        'confirmed_category': confirmedCategory,
        'user_id': userId,
      });
      
      if (newName != null && newName.isNotEmpty) {
        request.fields['new_name'] = newName;
      }

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      final data = json.decode(responseBody);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'message': data['message'],
          'document_id': data['document_id'],
          'new_version': data['new_version'],
          'drive_id': data['drive_id'],
          'modified_by': data['modified_by'],
          'updated_document': data['updated_document'],
          'updated_fields': data['updated_fields'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to update document',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Update document metadata (name, category)
  static Future<Map<String, dynamic>> updateDocumentMetadata({
    required String documentId,
    String? newName,
    String? newCategory,
  }) async {
    try {
      var request = http.MultipartRequest(
        'PUT',
        Uri.parse('$baseUrl/api/doc/update/$documentId'),
      );
      
      if (newName != null && newName.isNotEmpty) {
        request.fields['new_name'] = newName;
      }
      
      if (newCategory != null && newCategory.isNotEmpty) {
        request.fields['new_category'] = newCategory;
      }

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      final data = json.decode(responseBody);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'message': data['message'],
          'document': data['document'],
          'updated_fields': data['updated_fields'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to update document metadata',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Delete document
  static Future<Map<String, dynamic>> deleteDocument(String documentId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/api/doc/delete/$documentId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'message': data['message'],
          'deleted_files_count': data['deleted_files_count'],
          'failed_deletions_count': data['failed_deletions_count'],
          'warning': data['warning'],
          'failed_files': data['failed_files'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to delete document',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get document info
  static Future<Map<String, dynamic>> getDocumentInfo(String documentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/doc/info/$documentId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'document': data['document'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to get document info',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get project documents
  static Future<Map<String, dynamic>> getProjectDocumentsList(String projectId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/doc/ProjectDocs/$projectId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'documents': data['documents'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to get project documents',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Get recent documents
  static Future<Map<String, dynamic>> getRecentDocuments({int limit = 10}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/doc/fetchall?limit=$limit'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'status': data['status'],
          'recent_documents': data['recent_documents'],
        };
      } else {
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to fetch recent documents',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Download document
  static Future<Map<String, dynamic>> downloadDocument(String documentId, {int? version}) async {
    try {
      String url = '$baseUrl/api/doc/download/$documentId';
      if (version != null) {
        url += '?version=$version';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': response.bodyBytes,
          'headers': response.headers,
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to download document',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // View document (get redirect URL)
  static Future<Map<String, dynamic>> viewDocument(String documentId, {int? version}) async {
    try {
      String url = '$baseUrl/api/doc/view/$documentId';
      if (version != null) {
        url += '?version=$version';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't follow redirects automatically to get the URL
      );

      if (response.statusCode == 302 || response.statusCode == 301) {
        // Get the redirect URL from headers
        final redirectUrl = response.headers['location'];
        return {
          'success': true,
          'view_url': redirectUrl,
        };
      } else if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'view_url': data['view_url'] ?? data['url'],
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to get view URL',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Direct download (Laavanjan's route)
  static Future<Map<String, dynamic>> downloadDocumentDirect(String documentId, {int? version}) async {
    try {
      String url = '$baseUrl/api/doc/download_direct/$documentId';
      if (version != null) {
        url += '?version=$version';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': response.bodyBytes,
          'headers': response.headers,
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['detail'] ?? 'Failed to download document directly',
        };
      }
    } catch (error) {
      return {
        'success': false,
        'message': 'Network error: ${error.toString()}',
      };
    }
  }

  // Helper: Get available document categories (same as web)
  static List<String> getDocumentCategories() {
    return [
      'Bill of Quantities (BOQ)',
      'Contracts and Agreements',
      'Tender Documents',
      'Progress Reports',
      'Final Reports',
      'Cost Estimations',
      'Invoices and Financials',
      'Drawings and Plans',
      'Permits and Licenses',
      'Safety and Compliance',
      'Other',
    ];
  }

  // Logout function
  static void logout() {
    _currentToken = null;
  }

  // Check if user is logged in
  static bool isLoggedIn() {
    return _currentToken != null;
  }

  // Get current token
  static String? getCurrentToken() {
    return _currentToken;
  }

  // Set token (for when you get it from login)
  static void setToken(String token) {
    _currentToken = token;
  }

  // Validation helpers
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  static bool isValidPhone(String phone) {
    final phoneRegex = RegExp(r'^\+?\d{10,15}$');
    return phoneRegex.hasMatch(phone);
  }

  // Helper: Check if file is supported
  static bool isSupportedFileType(String filePath) {
    final supportedExtensions = ['.pdf', '.docx', '.xls', '.xlsx'];
    final fileExtension = filePath.toLowerCase().split('.').last;
    return supportedExtensions.contains('.$fileExtension');
  }

  // Helper: Get file size in MB
  static double getFileSizeInMB(String filePath) {
    final file = File(filePath);
    if (file.existsSync()) {
      final bytes = file.lengthSync();
      return bytes / (1024 * 1024);
    }
    return 0.0;
  }
}