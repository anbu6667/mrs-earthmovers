export const translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    view: 'View',
    add: 'Add',
    update: 'Update',
    confirm: 'Confirm',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    about: 'About'
  },
  auth: {
    welcome: 'Welcome to MRS Earthmovers',
    loginTitle: 'Login to your account',
    registerTitle: 'Create your account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    role: 'Role',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    invalidCredentials: 'Invalid email or password',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match'
  },
  admin: {
    dashboard: 'Admin Dashboard',
    vehicles: 'Vehicle Management',
    workRequests: 'Work Requests',
    attendance: 'Attendance Management',
    reports: 'Reports & Analytics',
    addVehicle: 'Add New Vehicle',
    totalVehicles: 'Total Vehicles',
    availableVehicles: 'Available Vehicles',
    emergencyVehicles: 'Emergency Vehicles',
    workRequests: 'Work Requests',
    pending: 'Pending',
    assigned: 'Assigned',
    inProgress: 'In Progress',
    completed: 'Completed',
    dailyReport: 'Daily Report',
    monthlyReport: 'Monthly Report',
    revenue: 'Revenue',
    totalRevenue: 'Total Revenue',
    todayRevenue: 'Today Revenue'
  },
  user: {
    portal: 'Customer Portal',
    trackWork: 'Track Your Work',
    newRequest: 'New Work Request',
    workType: 'Work Type',
    description: 'Description',
    location: 'Location',
    duration: 'Duration',
    estimatedCost: 'Estimated Cost',
    finalCost: 'Final Cost',
    paymentStatus: 'Payment Status',
    vehicleAssigned: 'Vehicle Assigned',
    driverAssigned: 'Driver Assigned',
    photoProofs: 'Photo Proofs',
    invoice: 'View Invoice'
  },
  driver: {
    portal: 'Driver Portal',
    workList: 'My Work Assignments',
    progress: 'Work Progress',
    attendance: 'My Attendance',
    complaint: 'Report Issue',
    startTime: 'Start Time',
    endTime: 'End Time',
    workHours: 'Work Hours',
    siteName: 'Site Name',
    odometerReading: 'Odometer Reading',
    notes: 'Notes',
    beforePhoto: 'Take Before Photo',
    duringPhoto: 'Take During Photo',
    afterPhoto: 'Take After Photo',
    completed: 'Completed',
    emergencyAlert: 'Emergency Alert',
    reportIssue: 'Report Issue'
  },
  status: {
    pending: 'Pending',
    assigned: 'Assigned',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    available: 'Available',
    unavailable: 'Unavailable',
    emergency: 'Emergency',
    breakdown: 'Breakdown',
    maintenance: 'Maintenance'
  },
  vehicle: {
    vehicleNumber: 'Vehicle Number',
    make: 'Make',
    model: 'Model',
    year: 'Year',
    type: 'Type',
    hourlyRate: 'Hourly Rate',
    capacity: 'Capacity',
    lastOdometer: 'Last Odometer',
    driver: 'Driver',
    location: 'Location'
  },
  work: {
    pipeline: 'Pipeline',
    earthwork: 'Earthwork',
    demolition: 'Demolition',
    roadConstruction: 'Road Construction',
    foundations: 'Foundations',
    landscaping: 'Landscaping',
    others: 'Others'
  },
  payment: {
    pending: 'Pending',
    partial: 'Partial',
    completed: 'Completed',
    failed: 'Failed'
  }
};

export const useTranslation = () => {
  const t = (key, fallback = key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || fallback;
  };

  return { t };
};