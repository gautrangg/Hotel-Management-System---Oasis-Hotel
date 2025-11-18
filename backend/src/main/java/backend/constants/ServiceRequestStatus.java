package backend.constants;

import java.util.Arrays;
import java.util.List;

/**
 * Constants for ServiceRequest status values.
 * These are the valid status values that can be stored in the database.
 */
public class ServiceRequestStatus {
    
    public static final String PENDING = "Pending";
    public static final String IN_PROGRESS = "In Progress";
    public static final String COMPLETED = "Completed";
    public static final String CANCELLED = "Cancelled";
    
    // For backward compatibility with existing data
    public static final String ASSIGNED = "Assigned";
    public static final String DONE = "Done";
    
    /**
     * List of all valid status values
     */
    private static final List<String> VALID_STATUSES = Arrays.asList(
            PENDING,
            IN_PROGRESS,
            COMPLETED,
            CANCELLED,
            ASSIGNED,  // Keep for backward compatibility
            DONE       // Keep for backward compatibility
    );
    
    /**
     * Check if a status value is valid
     * @param status the status to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValid(String status) {
        if (status == null || status.trim().isEmpty()) {
            return false;
        }
        return VALID_STATUSES.stream()
                .anyMatch(s -> s.equalsIgnoreCase(status.trim()));
    }
    
    /**
     * Get all valid status values as a formatted string for error messages
     */
    public static String getValidStatusesString() {
        return String.join(", ", VALID_STATUSES);
    }
    
    private ServiceRequestStatus() {
        // Private constructor to prevent instantiation
    }
}
