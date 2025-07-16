import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../models/user_model.dart';
import '../../models/project_model.dart'; // Ensure ProjectModel's fromJson is correctly handling types
import '../../services/auth_service.dart';
import 'project_detail_screen.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({Key? key}) : super(key: key);

  @override
  _ProjectsScreenState createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  List<ProjectModel> projects = [];
  UserModel? currentUser;
  bool isLoading = true;
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadUserData();
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
        });
        _loadProjects();
      } else {
        setState(() {
          errorMessage = result['message'];
          isLoading = false;
        });
      }
    } catch (error) {
      setState(() {
        errorMessage = 'Failed to load user data: ${error.toString()}';
        isLoading = false;
      });
    }
  }

  Future<void> _loadProjects() async {
    if (currentUser == null) {
      setState(() {
        isLoading = false; // Stop loading if no user
        errorMessage = 'User not loaded. Cannot fetch projects.';
      });
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    try {
      final result = await AuthService.getUserProjects(currentUser!.userId);

      if (result['success']) {
        setState(() {
          projects = (result['projects'] as List)
              .map((project) => ProjectModel.fromJson(project as Map<String, dynamic>))
              .toList();
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = result['message'];
          isLoading = false;
        });
      }
    } catch (error) {
      setState(() {
        errorMessage = 'Failed to load projects: ${error.toString()}';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightSky,
      appBar: AppBar(
        title: const Text('My Projects'),
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: AppTheme.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProjects,
          ),
        ],
      ),
      body: SafeArea(
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryBlue),
      );
    }

    if (errorMessage.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppTheme.errorRed,
            ),
            const SizedBox(height: 16),
            Text(
              'Error Loading Projects',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.darkBlue,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                errorMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.greyText),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadProjects,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: AppTheme.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (projects.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.folder_off,
              size: 64,
              color: AppTheme.greyText,
            ),
            const SizedBox(height: 16),
            const Text(
              'No Projects Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.darkBlue,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You are not assigned to any projects yet.',
              style: TextStyle(color: AppTheme.greyText),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Header Stats
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              _buildStatItem('Total', projects.length.toString(), AppTheme.primaryBlue),
              _buildStatItem('Active', _getActiveCount().toString(), AppTheme.successGreen),
              _buildStatItem('Completed', _getCompletedCount().toString(), AppTheme.accentBlue),
            ],
          ),
        ),

        // Projects Grid
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 1,
                // Slightly increase aspect ratio to give more vertical space per tile
                // This is a common way to deal with overflow in GridView items
                childAspectRatio: 3.7, // Changed from 3.5 to 3.7
                mainAxisSpacing: 12,
              ),
              itemCount: projects.length,
              itemBuilder: (context, index) {
                return _buildProjectTile(projects[index]);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
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
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.greyText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProjectTile(ProjectModel project) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProjectDetailScreen(project: project),
          ),
        );
      },
      child: Container(
        // Adjusted vertical padding from 16 to 12. Let's try 10 for even more space.
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    project.projectName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.darkBlue,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(project.projectStatus),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    project.projectStatus,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            Text(
              'Client: ${project.client}',
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.greyText,
              ),
            ),
            // Reduce this SizedBox height as well if needed
            const SizedBox(height: 4), 

            // Progress Bar (this is the Column causing overflow)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Progress',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.darkBlue,
                      ),
                    ),
                    Text(
                      '${(project.progressPercentage * 100).toInt()}%',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  ],
                ),
                // This SizedBox was causing the 11px overflow directly
                // Remove it or make it very small if you want to eliminate the overflow line.
                const SizedBox(height: 0), // Changed from 2 to 0 to eliminate any extra space
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: project.progressPercentage.clamp(0.0, 1.0),
                    backgroundColor: AppTheme.lightSky,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      project.isOverdue ? AppTheme.errorRed : AppTheme.successGreen,
                    ),
                    minHeight: 10, // Kept at 10, if overflow persists, try increasing to 11 or 12
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return AppTheme.successGreen;
      case 'completed':
        return AppTheme.primaryBlue;
      case 'on hold':
      case 'onhold':
        return AppTheme.warningOrange;
      case 'cancelled':
        return AppTheme.errorRed;
      default:
        return AppTheme.greyText;
    }
  }

  int _getActiveCount() {
    return projects.where((p) =>
      p.projectStatus.toLowerCase() == 'active' ||
      p.projectStatus.toLowerCase() == 'in progress'
    ).length;
  }

  int _getCompletedCount() {
    return projects.where((p) => p.projectStatus.toLowerCase() == 'completed').length;
  }
}