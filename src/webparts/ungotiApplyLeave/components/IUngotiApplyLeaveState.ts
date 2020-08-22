export interface IUngotiApplyLeaveState {
    page: number;
    rowsPerPage: number;
    openAddPopup: boolean;
    openDeleteConfirm: boolean;
    listLeaveDetails: LeaveDetails[];
    copyListLeaveDetails: LeaveDetails[];
    
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
