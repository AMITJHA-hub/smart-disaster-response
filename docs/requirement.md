# Smart Disaster Response System

## Actors

- Citizen
- Volunteer
- Donor
- Administrator

## Functional Requirements

### FR-01 User Registration and Login
- Users can register.
- Users can log in.
- Roles: Citizen, Volunteer, Donor, Administrator.

### FR-02 Emergency Report Submission
- Citizen can submit an emergency report.
- Emergency details are stored.
- Optional image can be uploaded.

### FR-03 AI Emergency Category Suggestion
- System may suggest an emergency category from the description.
- AI suggestion is optional.
- AI does not make the final decision.

### FR-04 Admin Emergency Verification
- Administrator can view submitted emergencies.
- Administrator can verify or reject an emergency.

### FR-05 Volunteer Profile and Availability
- Volunteer can update skills.
- Volunteer can update area.
- Volunteer can update availability.

### FR-06 Volunteer Filtering
- Administrator can filter volunteers by:
  - Area
  - Skills
  - Availability

### FR-07 Volunteer Assignment
- Administrator can assign volunteers to verified emergencies.
- Volunteer can view assigned tasks.
- Volunteer can update task status.

### FR-08 Emergency Requirement Management
- Administrator can add/manage required resources.
- Requirements belong to an emergency.

### FR-09 Donation Pledge
- Donor can view active emergencies.
- Donor can pledge money or resources.
- Donation pledge is stored against an emergency.

### FR-10 Emergency Status Tracking
- Administrator can update emergency status.
- Users can view the report status where applicable.

## Main Interfaces

- Login / Registration
- Citizen Dashboard
- Emergency Reporting Form
- Volunteer Dashboard
- Donor Dashboard
- Administrator Dashboard

## Technology

- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Communication: REST API
- Data format: JSON
- Protocol: HTTPS

## Important Constraints

- Every emergency must be verified by an administrator.
- Volunteer assignment depends on skills and availability.
- AI only suggests a category.
- No real-time GPS tracking.
- No online payment integration.
- No rescue agency integration.
- No advanced AI features.