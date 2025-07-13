import 'package:flutter/material.dart';

class AppTheme {
  // Blue Sky Theme Colors
  static const Color primaryBlue = Color(0xFF166394);
  static const Color lightBlue = Color(0xFF45496b);
  static const Color skyBlue = Color(0xFF87CEEB);
  static const Color lightSky = Color(0xFFECF6FF);
  static const Color darkBlue = Color(0xFF0F4C75);
  static const Color accentBlue = Color(0xFF3282B8);
  
  // Additional Colors
  static const Color successGreen = Color(0xFF10B981);
  static const Color errorRed = Color(0xFFEF4444);
  static const Color warningOrange = Color(0xFFF59E0B);
  static const Color greyText = Color(0xFF6B7280);
  static const Color lightGrey = Color(0xFFF9FAFB);
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF111827);

  static ThemeData get lightTheme {
    return ThemeData(
      primarySwatch: createMaterialColor(primaryBlue),
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: lightSky,
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryBlue,
        foregroundColor: white,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          elevation: 2,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: skyBlue.withOpacity(0.3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: skyBlue.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: errorRed),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      cardTheme: CardThemeData(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        color: white,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          color: darkBlue,
          fontSize: 32,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: darkBlue,
          fontSize: 24,
          fontWeight: FontWeight.w600,
        ),
        titleLarge: TextStyle(
          color: darkBlue,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: black,
          fontSize: 16,
        ),
        bodyMedium: TextStyle(
          color: greyText,
          fontSize: 14,
        ),
        labelLarge: TextStyle(
          color: white,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static MaterialColor createMaterialColor(Color color) {
    List strengths = <double>[.05];
    Map<int, Color> swatch = {};
    final int r = color.red, g = color.green, b = color.blue;

    for (int i = 1; i < 10; i++) {
      strengths.add(0.1 * i);
    }
    for (var strength in strengths) {
      final double ds = 0.5 - strength;
      swatch[(strength * 1000).round()] = Color.fromRGBO(
        r + ((ds < 0 ? r : (255 - r)) * ds).round(),
        g + ((ds < 0 ? g : (255 - g)) * ds).round(),
        b + ((ds < 0 ? b : (255 - b)) * ds).round(),
        1,
      );
    }
    return MaterialColor(color.value, swatch);
  }
}