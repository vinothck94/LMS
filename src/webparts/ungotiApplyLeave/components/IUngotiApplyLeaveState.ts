export interface IUngotiApplyLeaveState {
    
    isManager: boolean;
    isHR: boolean;

    page: number;
    rowsPerPage: number;
    openAddPopup: boolean;
    openDeleteConfirm: boolean;
    listLeaveDetails: LeaveDetails[];
    copyListLeaveDetails: LeaveDetails[];

    fileName: string;

    formData: LeaveRequest;

    allLeaveTypes: any[];
    allWeekEndConfig: any[];
    allHolidays: any[];
    leaveBalance: any;
    currentUser: any;

    isview: boolean;
    openleavemenu: boolean;

    openDatePicker: boolean;
    strFrom: string;
    strTo: string;

    errorfromto: string;
    errorleavetype: string;

    showManager: boolean;
    showHR: boolean;
    showHolidays: boolean;
}

export interface LeaveRequest {
    Id: number;
    ApproverId: number;
    RequesterId: number;
    LeaveTypeId: number;
    From: Date;
    To: Date;
    NoofDays: number;
    Detail: string;
    Status: string;
    FromHalf: string;
    ToHalf: string;
    DocumentUrl: string;
}

export interface LeaveDetails {
    Id: number;
    LeaveTypeId: number;
    LeaveType: string;
    From: Date;
    strFrom: string;
    To: Date;
    strTo: string;
    NoofDays: number;
    strNoofDays: string;
    Detail: string;
    Status: string;
}
