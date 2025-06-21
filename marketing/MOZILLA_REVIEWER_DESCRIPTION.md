# Mozilla Extension Review - Amrita Attendance Fetcher

## Extension Overview

**Name:** Amrita Attendance Fetcher  
**Purpose:** Academic utility tool for Amrita University students  
**Target Audience:** 30,000+ Amrita University students  
**Functionality:** Automated attendance data extraction and visualization

## Core Functionality

This extension serves as a legitimate academic utility tool that addresses a real need for Amrita University students to efficiently track their attendance data. The extension performs the following specific operations:

### 1. Data Extraction
- **Source:** Official Amrita University student portal (https://students.amrita.edu/client/class-attendance)
- **Method:** Scrapes attendance data from HTML tables on the authenticated student's own account
- **Data Types:** Course names, attendance percentages, present/absent counts, faculty information
- **Scope:** Only data visible to the authenticated student in their personal dashboard

### 2. Data Transfer
- **Destination:** sad.nithitsuki.com (developer's attendance visualization website)
- **Storage Method:** Browser localStorage (temporary, client-side only)
- **Purpose:** Enable enhanced visualization and analytics of the student's own attendance data
- **Privacy:** No server-side storage, no data transmission to third parties

### 3. User Interface Enhancements
- **Portal Integration:** Adds a "Go to Dashboard!" button on the university attendance page
- **Website Integration:** Adds functionality to sad.nithitsuki.com for attendance updates
- **User Experience:** Streamlines the process of viewing attendance data in an enhanced format

## Technical Implementation

### Content Scripts
- `content-script.js`: Injects button on university portal (students.amrita.edu)
- `website-modifier.js`: Enhances user experience on sad.nithitsuki.com
- Scope limited to specific URLs via manifest permissions

### Background Processing
- `worker.js`: Handles message passing between content scripts and popup
- `attendance-extractor.js`: Contains data parsing utilities
- No external API calls, no data transmission beyond localStorage

### Data Flow
1. Student authenticates on official Amrita portal
2. Extension extracts attendance data from student's authenticated session
3. Data is stored in browser's localStorage for sad.nithitsuki.com
4. Student can view enhanced visualizations on the dashboard site
5. No persistent storage, no external data sharing

## Legitimacy and Educational Value

### University Context
- **Institution:** Amrita Vishwa Vidyapeetham (Amrita University)
- **Student Population:** 30,000+ enrolled students across multiple campuses
- **Recognition:** UGC recognized, NAAC A++ accredited institution
- **Portal Usage:** Official student portal used daily by thousands of students

### Educational Need
- Students need to track attendance to meet minimum 75% requirement
- Current portal provides basic tabular data without analytics
- Extension enhances student experience with better visualizations
- Helps students make informed decisions about their academic standing

### Comparison to Similar Extensions
- Similar to extensions that enhance Canvas, Blackboard, or other LMS platforms
- Follows established pattern of academic utility extensions
- Provides value-added visualization without disrupting core functionality

## Privacy and Security

### Data Handling
- **No Collection:** Extension doesn't collect or store personal data
- **Local Processing:** All operations happen within the user's browser
- **Temporary Storage:** Uses localStorage only for immediate data transfer
- **No Transmission:** No data sent to external servers or analytics services

### Permissions Justification
- `tabs`: Required for navigation between portal and dashboard
- `scripting`: Required for data extraction from authenticated pages
- `storage`: Required for temporary localStorage operations
- `host_permissions`: Limited to specific domains (Amrita portal + dashboard site)

### Security Measures
- Open source code available for review
- Minimal permission requests
- No external dependencies or third-party scripts
- Content script injection limited to specific authenticated pages

## Development and Maintenance

### Developer Information
- Individual developer creating tools for fellow students
- Dashboard website (sad.nithitsuki.com) maintained by same developer
- Extension complements existing web-based attendance visualization tool
- Responsive to user feedback and university portal changes

### Code Quality
- Modular architecture with separated concerns
- Error handling and user feedback mechanisms
- Configuration-based design for easy maintenance
- Following browser extension best practices

## Reviewer Notes

### Why This Should Be Approved
1. **Legitimate Educational Purpose:** Serves real academic need for 30k+ students
2. **Transparent Functionality:** Clear, limited scope with no hidden features
3. **Privacy Compliant:** No data collection, all processing is local
4. **Institution Scale:** Amrita University is a major educational institution
5. **Open Source:** Code available for complete transparency

### Similar Approved Extensions
- Canvas enhancement extensions
- University portal improvement tools
- Academic productivity extensions
- Student dashboard utilities

### User Safety
- No access to sensitive authentication data
- Only processes data already visible to authenticated student
- No modification of university portal functionality
- Clear user consent through manual button interactions

## Contact Information

For any clarifications or additional information needed during the review process, please feel free to reach out. The extension code is available for complete review, and the developer is committed to addressing any concerns or suggestions from the Mozilla review team.

## Conclusion

This extension represents a legitimate academic utility tool that enhances the educational experience for a large student population. It follows established patterns for university portal enhancement extensions while maintaining strict privacy and security standards. The functionality is transparent, limited in scope, and serves a clear educational purpose.
