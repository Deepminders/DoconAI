import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// Custom Text Field Widget
class CustomTextField extends StatelessWidget {
  final String label;
  final String placeholder;
  final TextEditingController controller;
  final bool isPassword;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final bool isRequired;

  const CustomTextField({
    Key? key,
    required this.label,
    required this.placeholder,
    required this.controller,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.isRequired = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppTheme.darkBlue,
            ),
            children: [
              if (isRequired)
                const TextSpan(
                  text: ' *',
                  style: TextStyle(color: AppTheme.errorRed),
                ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          obscureText: isPassword,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: TextStyle(
              color: AppTheme.greyText.withOpacity(0.6),
              fontSize: 14,
            ),
            prefixIcon: _getIcon(),
          ),
        ),
      ],
    );
  }

  Widget? _getIcon() {
    if (isPassword) return const Icon(Icons.lock_outline, color: AppTheme.primaryBlue);
    if (keyboardType == TextInputType.emailAddress) return const Icon(Icons.email_outlined, color: AppTheme.primaryBlue);
    if (keyboardType == TextInputType.phone) return const Icon(Icons.phone_outlined, color: AppTheme.primaryBlue);
    if (label.toLowerCase().contains('username')) return const Icon(Icons.person_outline, color: AppTheme.primaryBlue);
    if (label.toLowerCase().contains('company')) return const Icon(Icons.business_outlined, color: AppTheme.primaryBlue);
    return const Icon(Icons.text_fields_outlined, color: AppTheme.primaryBlue);
  }
}

// Custom Button Widget
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isSecondary;
  final double? width;

  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isSecondary = false,
    this.width,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isSecondary ? AppTheme.lightSky : AppTheme.primaryBlue,
          foregroundColor: isSecondary ? AppTheme.primaryBlue : AppTheme.white,
          elevation: isSecondary ? 0 : 2,
          side: isSecondary ? const BorderSide(color: AppTheme.primaryBlue) : null,
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.white),
                ),
              )
            : Text(
                text,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }
}

// Gender Selection Widget
class GenderSelection extends StatelessWidget {
  final String selectedGender;
  final Function(String) onChanged;

  const GenderSelection({
    Key? key,
    required this.selectedGender,
    required this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: const TextSpan(
            text: 'Gender',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppTheme.darkBlue,
            ),
            children: [
              TextSpan(
                text: ' *',
                style: TextStyle(color: AppTheme.errorRed),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppTheme.skyBlue.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Expanded(
                child: RadioListTile<String>(
                  title: const Text('Male'),
                  value: 'Male',
                  groupValue: selectedGender,
                  onChanged: (value) => onChanged(value!),
                  activeColor: AppTheme.primaryBlue,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              Expanded(
                child: RadioListTile<String>(
                  title: const Text('Female'),
                  value: 'Female',
                  groupValue: selectedGender,
                  onChanged: (value) => onChanged(value!),
                  activeColor: AppTheme.primaryBlue,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// Auth Header Widget
class AuthHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const AuthHeader({
    Key? key,
    required this.title,
    required this.subtitle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.headlineLarge,
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 32),
      ],
    );
  }
}