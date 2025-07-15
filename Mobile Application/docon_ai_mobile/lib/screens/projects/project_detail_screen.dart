import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../models/project_model.dart';

class ProjectDetailScreen extends StatelessWidget {
  final ProjectModel project;

  const ProjectDetailScreen({Key? key, required this.project}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightSky,
      appBar: AppBar(
        title: const Text('Project Details'),
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: AppTheme.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Project Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppTheme.primaryBlue, AppTheme.accentBlue],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryBlue.withOpacity(0.3), // Fixed: withValues -> withOpacity
                      blurRadius: 12,
                      offset: const Offset(0, 6),
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
                              color: AppTheme.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2), // Fixed: withValues -> withOpacity
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            project.projectStatus,
                            style: const TextStyle(
                              color: AppTheme.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Project ID: ${project.projectId}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9), // Fixed: withValues -> withOpacity
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Project Information
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05), // Fixed: withValues -> withOpacity
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Project Information',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.darkBlue,
                      ),
                    ),
                    const SizedBox(height: 16),

                    _buildInfoRow('Client', project.client, Icons.business),
                    const SizedBox(height: 12),
                    _buildInfoRow('Start Date', DateFormat('MMM dd, yyyy').format(project.startDate), Icons.calendar_today),
                    const SizedBox(height: 12),
                    _buildInfoRow('End Date', DateFormat('MMM dd, yyyy').format(project.endDate), Icons.event),
                    const SizedBox(height: 12),
                    _buildInfoRow('Duration', '${project.endDate.difference(project.startDate).inDays} days', Icons.schedule),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Progress Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05), // Fixed: withValues -> withOpacity
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Project Progress',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.darkBlue,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Progress Bar
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Completion',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.darkBlue,
                          ),
                        ),
                        Text(
                          '${(project.progressPercentage * 100).toInt()}%',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryBlue,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: project.progressPercentage.clamp(0.0, 1.0),
                        backgroundColor: AppTheme.lightSky,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          project.isOverdue ? AppTheme.errorRed : AppTheme.successGreen,
                        ),
                        minHeight: 12,
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Status Indicators
                    Row(
                      children: [
                        _buildStatusIndicator(
                          'Days Elapsed',
                          '${DateTime.now().difference(project.startDate).inDays}',
                          AppTheme.primaryBlue,
                        ),
                        const SizedBox(width: 16),
                        _buildStatusIndicator(
                          'Days Remaining',
                          '${project.endDate.difference(DateTime.now()).inDays}',
                          project.isOverdue ? AppTheme.errorRed : AppTheme.successGreen,
                        ),
                      ],
                    ),

                    if (project.isOverdue) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.errorRed.withOpacity(0.1), // Fixed: withValues -> withOpacity
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.errorRed.withOpacity(0.3)), // Fixed: withValues -> withOpacity
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning, color: AppTheme.errorRed, size: 20),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'This project is overdue',
                                style: TextStyle(
                                  color: AppTheme.errorRed,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('View documents feature coming soon!'),
                            backgroundColor: AppTheme.primaryBlue,
                          ),
                        );
                      },
                      icon: const Icon(Icons.folder_open),
                      label: const Text('View Documents'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryBlue,
                        foregroundColor: AppTheme.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('View team feature coming soon!'),
                            backgroundColor: AppTheme.primaryBlue,
                          ),
                        );
                      },
                      icon: const Icon(Icons.people),
                      label: const Text('View Team'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.white,
                        foregroundColor: AppTheme.primaryBlue,
                        side: const BorderSide(color: AppTheme.primaryBlue),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.lightSky,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.primaryBlue, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.greyText,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.darkBlue,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusIndicator(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1), // Fixed: withValues -> withOpacity
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: color,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}