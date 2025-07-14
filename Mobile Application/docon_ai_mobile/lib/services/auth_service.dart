import 'dart:convert';
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

  // Validation helpers
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+');
    return emailRegex.hasMatch(email);
  }

  static bool isValidPhone(String phone) {
    final phoneRegex = RegExp(r'^\+?\d{10,15}');
    return phoneRegex.hasMatch(phone);
  }
}
