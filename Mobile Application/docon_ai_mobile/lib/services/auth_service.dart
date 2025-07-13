import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'http://10.0.2.2:8000';
  
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

  // Validation helpers
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  static bool isValidPhone(String phone) {
    final phoneRegex = RegExp(r'^\+?\d{10,15}$');
    return phoneRegex.hasMatch(phone);
  }
}