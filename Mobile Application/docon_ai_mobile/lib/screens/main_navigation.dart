import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'home/dashboard_screen.dart';
import 'projects/projects_screen.dart';
import 'documents/documents_screen.dart';
import 'profile/profile_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({Key? key}) : super(key: key);

  @override
  _MainNavigationState createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  
  late List<Widget> _screens;
  late List<String> _titles;

  @override
  void initState() {
    super.initState();
    _initializeScreens();
  }

  void _initializeScreens() {
    _screens = [
      DashboardScreen(),
      ProjectsScreen(),
      DocumentsScreen(),
      ProfileScreen(),
    ];

    _titles = [
      'Dashboard',
      'Projects',
      'Documents',
      'Profile',
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: _buildBottomNavigation(),
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.transparent,
        elevation: 0,
        selectedItemColor: AppTheme.primaryBlue,
        unselectedItemColor: AppTheme.greyText,
        selectedLabelStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
        unselectedLabelStyle: const TextStyle(
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
        items: [
          BottomNavigationBarItem(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _currentIndex == 0 ? AppTheme.lightSky : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _currentIndex == 0 ? Icons.dashboard : Icons.dashboard_outlined,
                size: 24,
              ),
            ),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _currentIndex == 1 ? AppTheme.lightSky : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _currentIndex == 1 ? Icons.folder : Icons.folder_outlined,
                size: 24,
              ),
            ),
            label: 'Projects',
          ),
          BottomNavigationBarItem(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _currentIndex == 2 ? AppTheme.lightSky : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _currentIndex == 2 ? Icons.description : Icons.description_outlined,
                size: 24,
              ),
            ),
            label: 'Documents',
          ),
          BottomNavigationBarItem(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _currentIndex == 3 ? AppTheme.lightSky : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _currentIndex == 3 ? Icons.person : Icons.person_outline,
                size: 24,
              ),
            ),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}