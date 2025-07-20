import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../models/user_model.dart';
import '../auth/login_screen.dart';

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  UserModel? currentUser;
  bool isLoading = true;
  String errorMessage = '';
  bool isUserIdExpanded = false;
  List<dynamic> userProjects = [];
  List<dynamic> recentDocuments = [];
  int documentCount = 0;
  int projectCount = 0;
  bool isLoadingProjects = false;
  bool isLoadingDocuments = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Widget _buildSidebar() {
    return Drawer(
      backgroundColor: AppTheme.white,
      child: Column(
        children: [
          // Sidebar Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppTheme.primaryBlue, AppTheme.accentBlue],
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User Avatar
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: AppTheme.white, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        currentUser?.firstName.isNotEmpty == true
                            ? currentUser!.firstName[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                          color: AppTheme.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    currentUser?.firstName ?? 'User',
                    style: const TextStyle(
                      color: AppTheme.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    currentUser?.userRole ?? 'Role',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Navigation Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _buildSidebarItem(
                  icon: Icons.dashboard,
                  title: 'Dashboard',
                  isSelected: true,
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),
                
                if (currentUser?.userRole.toLowerCase() == 'project owner' || 
                    currentUser?.userRole.toLowerCase() == 'project manager') ...[
                  _buildSidebarItem(
                    icon: Icons.folder_open,
                    title: 'Projects',
                    subtitle: '$projectCount projects',
                    onTap: () {
                      Navigator.pop(context);
                      _showProjectsBottomSheet();
                    },
                  ),
                  _buildSidebarItem(
                    icon: Icons.people,
                    title: 'Team Members',
                    onTap: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Team members feature coming soon!'),
                          backgroundColor: AppTheme.primaryBlue,
                        ),
                      );
                    },
                  ),
                  _buildSidebarItem(
                    icon: Icons.analytics,
                    title: 'Analytics',
                    onTap: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Analytics feature coming soon!'),
                          backgroundColor: AppTheme.primaryBlue,
                        ),
                      );
                    },
                  ),
                ],
                
                _buildSidebarItem(
                  icon: Icons.person,
                  title: 'Profile',
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Profile feature coming soon!'),
                        backgroundColor: AppTheme.primaryBlue,
                      ),
                    );
                  },
                ),
                _buildSidebarItem(
                  icon: Icons.settings,
                  title: 'Settings',
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Settings feature coming soon!'),
                        backgroundColor: AppTheme.primaryBlue,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          
          // Logout Button
          Container(
            padding: const EdgeInsets.all(16),
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppTheme.errorRed),
              title: const Text(
                'Logout',
                style: TextStyle(color: AppTheme.errorRed, fontWeight: FontWeight.w600),
              ),
              onTap: () {
                Navigator.pop(context);
                _showLogoutDialog();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem({
    required IconData icon,
    required String title,
    String? subtitle,
    bool isSelected = false,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: isSelected ? AppTheme.lightSky : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isSelected ? AppTheme.primaryBlue : AppTheme.greyText,
          size: 24,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? AppTheme.primaryBlue : AppTheme.darkBlue,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            fontSize: 16,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle,
                style: const TextStyle(
                  color: AppTheme.greyText,
                  fontSize: 12,
                ),
              )
            : null,
        onTap: onTap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _showProjectsBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: AppTheme.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.greyText.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Your Projects',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.darkBlue,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.lightSky,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$projectCount Projects',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Projects List
            Expanded(
              child: isLoadingProjects
                  ? const Center(
                      child: CircularProgressIndicator(color: AppTheme.primaryBlue),
                    )
                  : userProjects.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.folder_off,
                                size: 64,
                                color: AppTheme.greyText,
                              ),
                              SizedBox(height: 16),
                              Text(
                                'No projects found',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: AppTheme.greyText,
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: userProjects.length,
                          itemBuilder: (context, index) {
                            final project = userProjects[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                leading: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryBlue,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.folder,
                                    color: AppTheme.white,
                                    size: 20,
                                  ),
                                ),
                                title: Text(
                                  project['project_name'] ?? 'Unnamed Project',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.darkBlue,
                                  ),
                                ),
                                subtitle: Text(
                                  project['project_status'] ?? 'No description',
                                  style: const TextStyle(
                                    color: AppTheme.greyText,
                                    fontSize: 12,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                trailing: const Icon(
                                  Icons.arrow_forward_ios,
                                  size: 16,
                                  color: AppTheme.greyText,
                                ),
                                onTap: () {
                                  // TODO: Navigate to project details
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Opening ${project['name']}...'),
                                      backgroundColor: AppTheme.primaryBlue,
                                    ),
                                  );
                                },
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

Future<void> _loadDocuments() async {
  if (currentUser?.userId == null) return;

  setState(() {
    isLoadingDocuments = true;
  });

  try {
    final result = await AuthService.getDocumentCount(currentUser!.userId);
    
    if (result['success']) {
      setState(() {
        recentDocuments = result['documents'];
        documentCount = recentDocuments.length;
        isLoadingDocuments = false;
      });
      print('Document Count: ${result['count']}');
    } else {
      setState(() {
        isLoadingDocuments = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load documents: ${result['message']}'),
          backgroundColor: AppTheme.errorRed,
        ),
      );
    }
  } catch (error) {
    setState(() {
      isLoadingDocuments = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Error loading documents: ${error.toString()}'),
        backgroundColor: AppTheme.errorRed,
      ),
    );
  }
}


Future<void> _loadDashboardData() async {
 if (currentUser?.userRole.toLowerCase() == 'project owner' || 
     currentUser?.userRole.toLowerCase() == 'project manager') {
   _loadUserProjects();
   
 }
}
  Future<void> _loadUserData() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    try {
      final result = await AuthService.getCurrentUser();
      
      if (result['success']) {
        setState(() {
          currentUser = UserModel.fromJson(result['user']);
          isLoading = false;
        });
        
        // Load projects for project managers/owners
        if (currentUser?.userRole.toLowerCase() == 'project owner' || 
            currentUser?.userRole.toLowerCase() == 'project manager') {
          _loadUserProjects();
        }
      } else {
        setState(() {
          errorMessage = result['message'];
          isLoading = false;
        });
        
        // If token is invalid, redirect to login
        if (result['message'].contains('token') || result['message'].contains('login')) {
          _redirectToLogin();
        }
      }
    } catch (error) {
      setState(() {
        errorMessage = 'Failed to load user data: ${error.toString()}';
        isLoading = false;
      });
    }
  }

  Future<void> _loadUserProjects() async {
    if (currentUser?.userId == null) return;
    
    setState(() {
      isLoadingProjects = true;
    });

    try {
      final result = await AuthService.getUserProjects(currentUser!.userId, currentUser!.userRole);
      
      if (result['success']) {
        setState(() {
          userProjects = result['projects'];
          projectCount = result['count'];
          isLoadingProjects = false;
        });
      } else {
        setState(() {
          isLoadingProjects = false;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load projects: ${result['message']}'),
            backgroundColor: AppTheme.errorRed,
          ),
        );
      }
    } catch (error) {
      setState(() {
        isLoadingProjects = false;
      });
    }
  }

  void _redirectToLogin() {
    AuthService.logout();
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.lightSky,
        body: const Center(
          child: CircularProgressIndicator(
            color: AppTheme.primaryBlue,
          ),
        ),
      );
    }

    if (errorMessage.isNotEmpty) {
      return Scaffold(
        backgroundColor: AppTheme.lightSky,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Error: $errorMessage',
                style: const TextStyle(color: AppTheme.errorRed),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // Reload dashboard data
                  // _loadDashboardData();
                },
                child: const Text('Retry'),
              ),
              TextButton(
                onPressed: () {
                  // Navigate back (this will go to login via MainNavigation)
                  Navigator.pop(context);
                },
                child: const Text('Back'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.lightSky,
      drawer: _buildSidebar(), // Add sidebar
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Hero Section with User Info and Logout
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32.0),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppTheme.primaryBlue, AppTheme.accentBlue],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryBlue.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Header with Logout Button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Builder(
                              builder: (context) => GestureDetector(
                                onTap: () => Scaffold.of(context).openDrawer(),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.menu,
                                    color: AppTheme.white,
                                    size: 20,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Dashboard',
                              style: TextStyle(
                                color: AppTheme.white,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: IconButton(
                            icon: const Icon(
                              Icons.logout,
                              color: AppTheme.white,
                              size: 24,
                            ),
                            onPressed: () {
                              _showLogoutDialog();
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // User Avatar
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(
                          color: AppTheme.white,
                          width: 3,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          currentUser?.firstName.isNotEmpty == true
                              ? currentUser!.firstName[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            color: AppTheme.white,
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Welcome Message
                    Text(
                      'Welcome Back!',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 16,
                      ),
                    ),
                    
                    const SizedBox(height: 8),
                    
                    // User's First Name
                    Text(
                      currentUser?.firstName ?? 'User',
                      style: const TextStyle(
                        color: AppTheme.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // User Information Cards
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 140,
                            child: _buildUserIdCard(),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: SizedBox(
                            height: 140,
                            child: _buildInfoCard(
                              'Role',
                              currentUser?.userRole ?? 'N/A',
                              Icons.work_outline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Role-based content
              if (currentUser?.userRole.toLowerCase() == 'project owner' || 
                  currentUser?.userRole.toLowerCase() == 'project manager')
                Expanded(
                  child: SingleChildScrollView(
                    child: _buildProjectManagerContent(),
                  ),
                )
              else
                Expanded(
                  child: Center(
                    child: Text(
                      'More features coming soon...',
                      style: const TextStyle(
                        color: AppTheme.greyText,
                        fontSize: 16,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserIdCard() {
    String userId = currentUser?.userId ?? 'N/A';
    String displayText;
    
    if (userId == 'N/A') {
      displayText = 'N/A';
    } else if (isUserIdExpanded) {
      displayText = userId;
    } else {
      displayText = userId.length > 8 ? '${userId.substring(0, 6)}...' : userId;
    }

    return GestureDetector(
      onTap: () {
        if (userId != 'N/A' && userId.length > 8) {
          setState(() {
            isUserIdExpanded = !isUserIdExpanded;
          });
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(isUserIdExpanded ? 'User ID expanded' : 'User ID collapsed'),
              duration: const Duration(milliseconds: 800),
              backgroundColor: AppTheme.primaryBlue,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          );
        }
      },
      child: Container(
        height: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.person_outline,
                  color: AppTheme.white,
                  size: 20,
                ),
                if (userId != 'N/A' && userId.length > 8) ...[
                  const SizedBox(width: 4),
                  Icon(
                    isUserIdExpanded ? Icons.visibility : Icons.visibility_off,
                    color: Colors.white.withValues(alpha: 0.7),
                    size: 14,
                  ),
                ],
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'User ID',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 2),
            Flexible(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Text(
                  displayText,
                  key: ValueKey(displayText),
                  style: const TextStyle(
                    color: AppTheme.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: isUserIdExpanded ? 3 : 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
            if (userId != 'N/A' && userId.length > 8) ...[
              const SizedBox(height: 2),
              Text(
                isUserIdExpanded ? 'Tap to hide' : 'Tap to show',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontSize: 9,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(String label, String value, IconData icon) {
    return Container(
      height: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: AppTheme.white,
            size: 20,
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(
                color: AppTheme.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProjectManagerContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Project Overview',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.darkBlue,
          ),
        ),
        const SizedBox(height: 16),
        
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Total Projects',
                isLoadingProjects ? '...' : projectCount.toString(),
                Icons.folder_open,
                AppTheme.primaryBlue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Documents',
                isLoadingDocuments?'...':documentCount.toString(), // Keep static for now
                Icons.description,
                AppTheme.successGreen,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Team Members',
                '28', // Keep static for now
                Icons.people,
                AppTheme.warningOrange,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Your Project Teams',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.darkBlue,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.lightSky,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'All Projects',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              _buildTeamMembersList(),
              
              const SizedBox(height: 16),
              
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Team management feature coming soon!'),
                        backgroundColor: AppTheme.primaryBlue,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: AppTheme.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text('Manage All Teams'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              color: AppTheme.greyText,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTeamMembersList() {
    final List<Map<String, dynamic>> teamMembers = [
      {
        'name': 'Sarah Johnson',
        'role': 'Frontend Developer',
        'project': 'E-commerce App',
        'avatar': 'S',
        'status': 'active'
      },
      {
        'name': 'Mike Chen',
        'role': 'Backend Developer', 
        'project': 'CRM System',
        'avatar': 'M',
        'status': 'active'
      },
      {
        'name': 'Emily Davis',
        'role': 'UI/UX Designer',
        'project': 'Mobile Banking',
        'avatar': 'E',
        'status': 'busy'
      },
      {
        'name': 'Alex Kumar',
        'role': 'DevOps Engineer',
        'project': 'Cloud Migration',
        'avatar': 'A',
        'status': 'active'
      },
    ];

    return Column(
      children: teamMembers.map((member) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: _getStatusColor(member['status']),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: Center(
                  child: Text(
                    member['avatar'],
                    style: const TextStyle(
                      color: AppTheme.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member['name'],
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.darkBlue,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      member['role'],
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.greyText,
                      ),
                    ),
                  ],
                ),
              ),
              
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.lightSky,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  member['project'],
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.primaryBlue,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active':
        return AppTheme.successGreen;
      case 'busy':
        return AppTheme.warningOrange;
      case 'offline':
        return AppTheme.greyText;
      default:
        return AppTheme.primaryBlue;
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            'Logout',
            style: TextStyle(
              color: AppTheme.darkBlue,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: const Text(
            'Are you sure you want to logout?',
            style: TextStyle(color: AppTheme.greyText),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppTheme.greyText),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _redirectToLogin();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.errorRed,
                foregroundColor: AppTheme.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }
}