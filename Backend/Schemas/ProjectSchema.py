
async def getAllProject(projects_list):
    projects_list = await projects_list.to_list(length=None)

    # Debugging: Print the project and its keys for inspection
    for project in projects_list:
        print(f"Project: {project}")
        print(f"Keys: {project.keys()}")

    # Process each project using getIndividualProject and return the result
    return [getIndividualProject(project) for project in projects_list]


def getIndividualProject(project):
    # Check for missing 'project_name' key and log an error
    if "project_name" not in project:
        print(f"Error: 'project_name' key is missing in project: {project}")

    # Extract and return project details, handling missing keys with .get()
    return {
        "projectid": str(project.get("_id", "Unknown")),
        "projectname": str(project.get("project_name", "Unknown")),
        "start_date": str(project.get("started_date", "Unknown")),
        "end_date": str(project.get("end_date", "Unknown")),
        "progress": str(project.get("progress", "Unknown")),
    }
