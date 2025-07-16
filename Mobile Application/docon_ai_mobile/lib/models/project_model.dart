class ProjectModel {
  final String projectId;
  final String projectName;
  final String projectStatus;
  final String client;
  final DateTime startDate;
  final DateTime endDate;

  ProjectModel({
    required this.projectId,
    required this.projectName,
    required this.projectStatus,
    required this.client,
    required this.startDate,
    required this.endDate,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    // This is the crucial part to fix the error.
    // Ensure that whatever type comes from the JSON, it's converted to a String
    // before being assigned to a String field or passed to DateTime.tryParse.
    // The `?.` (null-aware access) ensures we don't call .toString() on a null value.
    // The `?? ''` (null coalescing) provides an empty string fallback if the value is null.
    final String rawProjectId = json['project_id']?.toString() ?? '';
    final String rawProjectName = json['project_name']?.toString() ?? '';
    final String rawProjectStatus = json['project_status']?.toString() ?? '';
    final String rawClient = json['client']?.toString() ?? '';
    final String rawStartDate = json['start_date']?.toString() ?? '';
    final String rawEndDate = json['end_date']?.toString() ?? '';

    return ProjectModel(
      projectId: rawProjectId,
      projectName: rawProjectName,
      projectStatus: rawProjectStatus,
      client: rawClient,
      startDate: DateTime.tryParse(rawStartDate) ?? DateTime.now(),
      endDate: DateTime.tryParse(rawEndDate) ?? DateTime.now(),
    );
  }

  // Calculate progress percentage based on dates
  double get progressPercentage {
    final now = DateTime.now();
    final totalDuration = endDate.difference(startDate).inDays;
    final elapsedDuration = now.difference(startDate).inDays;
    
    // Handle cases where totalDuration might be zero (start and end date are the same)
    if (totalDuration == 0) {
      return (projectStatus.toLowerCase() == 'completed') ? 1.0 : 0.0;
    }
    
    if (elapsedDuration < 0) return 0.0; // Project hasn't started yet
    
    // Ensure progress is clamped between 0 and 1 (0% to 100%)
    return (elapsedDuration / totalDuration).clamp(0.0, 1.0);
  }

  // Check if project is overdue
  bool get isOverdue {
    // A project is considered overdue if the current date is after its end date
    // AND its status is not 'completed'.
    return DateTime.now().isAfter(endDate) && projectStatus.toLowerCase() != 'completed';
  }
}