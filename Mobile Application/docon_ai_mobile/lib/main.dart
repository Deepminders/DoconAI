import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/auth/login_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Mobile App',
      theme: AppTheme.lightTheme,
      home: LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}