class UserModel {
  final String userId;
  final String firstName;
  final String userRole;
  final String username;
  final String email;

  UserModel({
    required this.userId,
    required this.firstName,
    required this.userRole,
    required this.username,
    required this.email,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['user_id'] ?? '',
      firstName: json['first_name'] ?? '',
      userRole: json['user_role'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'first_name': firstName,
      'user_role': userRole,
      'username': username,
      'email': email,
    };
  }

  // Helper method to get display name
  String get displayName {
    return firstName.isNotEmpty ? firstName : username;
  }

  // Helper method to get role display
  String get roleDisplay {
    return userRole.isNotEmpty ? userRole : 'User';
  }
}