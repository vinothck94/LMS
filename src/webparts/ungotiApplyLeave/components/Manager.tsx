import * as React from 'react';
import { IUngotiApplyLeaveProps } from './IUngotiApplyLeaveProps';
import { escape } from '@microsoft/sp-lodash-subset';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { useRef, useState } from 'react';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/fields";
import "@pnp/sp/files";
import "@pnp/sp/security/web";
import "@pnp/sp/site-users/web";


import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import Popper from '@material-ui/core/Popper';

import Grid from '@material-ui/core/Grid';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AddIcon from '@material-ui/icons/Add';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { DateRangePicker } from "materialui-daterange-picker";

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

import MaterialTable, { Column, Icons } from 'material-table';


import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import '../../../scss/styles.scss';

import {
  Typography, ButtonGroup,
  ListItem,
  Badge,
  List,
  ListItemText,
  LinearProgress,
  Menu
} from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import MenuList from '@material-ui/core/MenuList';

import styles from "./UngotiApplyLeave.module.scss";

import "alertifyjs";

import "../../../ExternalRef/CSS/style.css";
import "../../../ExternalRef/CSS/alertify.min.css";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");

import { IUngotiApplyLeaveState, LeaveDetails } from './IUngotiApplyLeaveState';



var folderPath = 'Leave Documents';
var currentDate = new Date(new Date().toDateString());

export default class Manager extends React.Component<{}, any> {

  public deleteId = 0;

  public oldLeaveTypeId = 0;
  public oldNoofDays = 0;
  public txtSelectDate = 'Select Date';

  file = null;

  public leaveColors = [
    'bg-purple',
    'bg-info',
    'bg-pink',
    'bg-success',
    'bg-purple',
    'bg-lavandor',
    'bg-orange',
    'bg-success'
  ];

  public leaveIcon = {
    vacation: 'dashboard-heading-icon-vacation',
    unpaid: 'dashboard-heading-icon-unpaid',
    sick: 'dashboard-heading-icon-sick',
    special: 'dashboard-heading-icon-special',
    others: 'dashboard-heading-icon-others',
  };

  constructor(props) {
    super(props);

    this.state = {
      formData: {},
      listLeaveDetails: [],
      copyListLeaveDetails: []
    };
    // sp.setup({
    //   sp: {
    //     baseUrl: this.props.siteUrl,
    //   },
    // });

    alertify.set("notifier", "position", "top-right");

    sp.web.currentUser.get().then((userdata) => {
      this.setState({ currentUser: userdata });
      this.loadAppliedLeave();
    });

  }

  public loadAppliedLeave = () => {
    sp.web.lists
      .getByTitle("LeaveRequest")
      .items
      .select("Id", "Title", "From", "To", "NoofDays", "Detail", "Status", "LeaveType/Id", "LeaveType/Title", "LeaveType/ScreenName", "ApproverId", "Requester/Id", "Requester/FirstName")
      .filter("Status eq 'Pending' and ApproverId eq '" + this.state.currentUser.Id + "'")
      .orderBy('Modified', false)
      .expand("LeaveType", "Requester")
      .get()
      .then((res) => {
        var lstData = this.state.listLeaveDetails;
        lstData = [];
        for (let index = 0; index < res.length; index++) {
          const leave = res[index];
          lstData.push({
            Id: leave.Id,
            ApproverId: leave.ApproverId,
            RequesterId: leave.Requester.Id,
            RequesterFirstName: leave.Requester.FirstName,
            LeaveTypeTitle: leave.LeaveType.Title,
            LeaveType: leave.LeaveType.ScreenName,
            LeaveTypeId: leave.LeaveType.Id,
            From: new Date(leave.From),
            strFrom: this.formatDate(new Date(leave.From)),
            To: new Date(leave.To),
            strTo: this.formatDate(new Date(leave.To)),
            NoofDays: parseFloat(leave.NoofDays),
            strNoofDays: leave.NoofDays,
            Detail: leave.Detail,
            Status: leave.Status
          });
        }
        this.setState({ listLeaveDetails: lstData, copyListLeaveDetails: lstData });
      });
  }


  public formatDate = (paramdate) => {
    var date = paramdate.getDate() + '';
    if (date.length == 1) {
      date = '0' + date;
    }
    var month = (paramdate.getMonth() + 1) + '';
    if (month.length == 1) {
      month = '0' + month;
    }
    return date + "/" + month + "/" + paramdate.getFullYear();
  }


  public viewLeave = (id) => {
    this.getLeaveData(id, true);
  }

  public getLeaveData = (id, view) => {
    sp.web.lists
      .getByTitle("LeaveRequest")
      .items.getById(id).get()
      .then((response) => {
        var from = new Date(response.From);
        var to = new Date(response.To);
        var formData = this.state.formData;
        formData = {
          Id: response.Id,
          ApproverId: response.ApproverId,
          RequesterId: response.RequesterId,
          LeaveTypeId: response.LeaveTypeId,
          From: from,
          To: to,
          NoofDays: response.NoofDays,
          Detail: response.Detail,
          Status: response.Status,
          FromHalf: response.FromHalf,
          ToHalf: response.ToHalf,
          DocumentUrl: response.DocumentUrl
        };
        var fromDefaultDate = this.formatDate(from);
        var toDefaultDate = this.formatDate(to);
        this.oldLeaveTypeId = response.LeaveTypeId;
        this.oldNoofDays = parseFloat(response.NoofDays);

        var name = '';
        if (response.DocumentUrl) {
          var sdata = response.DocumentUrl.split('/');
          name = sdata[sdata.length - 1];
        }

        this.setState({ formData: formData, strFrom: fromDefaultDate, strTo: toDefaultDate, fileName: name, isview: view });
      });
  }


  public closeViewPopup = () => {
    this.setState({ isview: false });
  }

  public openConfirm = (value, id = 0, status = '') => {
    if (value) {
      var currentYear = new Date().getFullYear();
      var currentleaveDetails = this.state.listLeaveDetails.filter(c => c.Id == id)[0];
      sp.web.lists
        .getByTitle("LeaveBalance")
        .items
        .filter("Year eq '" + currentYear + "' and EmployeeEmailId eq '" + currentleaveDetails.RequesterId + "'")
        .get()
        .then((res) => {
          this.setState({ leaveBalance: res[0] });
        });
      this.getLeaveData(id, false);
      this.setState({ currentleaveDetails: currentleaveDetails });
    }
    this.setState({ showConfirm: value, id: id, status: status });
  }

  public submit = () => {
    if (this.state.status == 'Rejected' && !this.state.note) {
      this.setState({ errornote: 'Detail is required', _errornote: true });
      return;
    } else {
      this.setState({ errornote: '', _errornote: false });
    }
    var formData = this.state.formData;
    var leaveBalance = this.state.leaveBalance;
    formData.ManagerNotes = this.state.note;
    formData.Status = this.state.status;
    var leaveTypeUsed = this.state.currentleaveDetails.LeaveTypeTitle + 'Used';
    var leaveTypePendingApproval = this.state.currentleaveDetails.LeaveTypeTitle + 'PendingApproval';
    leaveBalance[leaveTypePendingApproval] = (parseInt(leaveBalance[leaveTypePendingApproval]) - parseInt(formData.NoofDays)) + '';
    if (this.state.status == 'Approved') {
      leaveBalance[leaveTypeUsed] = (parseInt(leaveBalance[leaveTypeUsed]) + parseInt(formData.NoofDays)) + '';
    }
    sp.web.lists
      .getByTitle("LeaveRequest")
      .items.getById(formData.Id)
      .update(formData)
      .then((response) => {
        this.updateLeaveBalance(leaveBalance);
        alertify.success('Leave updated successfully');
        this.loadAppliedLeave();
        this.setState({ showConfirm: false });
      });

  }

  public updateLeaveBalance = (leaveBalance) => {
    sp.web.lists
      .getByTitle("LeaveBalance")
      .items.getById(leaveBalance.Id)
      .update(leaveBalance)
      .then((response) => {
      });
  }

  public inputChangeHandler = (e) => {
    this.setState({
      note: e.target.value
    });
    if (e.target.value) {
      this.setState({ errornote: '', _errornote: false });
    }
  }

  public render(): React.ReactElement {

    const columns = [
      { field: 'LeaveType', title: 'Type' },
      { field: 'RequesterFirstName', title: 'Requester' },
      { field: 'strFrom', title: 'From' },
      { field: 'strTo', title: 'To' },
      { field: 'strNoofDays', title: 'No. of days' },
      // { field: 'Status', title: 'Status' },
      // { field: 'Action', title: 'Action' },
    ];


    const tableIcons: Icons = {
      Add: forwardRef((props: any, ref: any) => <AddBox {...props} ref={ref} />),
      Check: forwardRef((props: any, ref: any) => <Check {...props} ref={ref} />),
      Clear: forwardRef((props: any, ref: any) => <Clear {...props} ref={ref} />),
      Delete: forwardRef((props: any, ref: any) => <DeleteOutline {...props} ref={ref} />),
      DetailPanel: forwardRef((props: any, ref: any) => <ChevronRight {...props} ref={ref} />),
      Edit: forwardRef((props: any, ref: any) => <Edit {...props} ref={ref} />),
      Export: forwardRef((props: any, ref: any) => <SaveAlt {...props} ref={ref} />),
      Filter: forwardRef((props: any, ref: any) => <FilterList {...props} ref={ref} />),
      FirstPage: forwardRef((props: any, ref: any) => <FirstPage {...props} ref={ref} />),
      LastPage: forwardRef((props: any, ref: any) => <LastPage {...props} ref={ref} />),
      NextPage: forwardRef((props: any, ref: any) => <ChevronRight {...props} ref={ref} />),
      PreviousPage: forwardRef((props: any, ref: any) => <ChevronLeft {...props} ref={ref} />),
      ResetSearch: forwardRef((props: any, ref: any) => <Clear {...props} ref={ref} />),
      Search: forwardRef((props: any, ref: any) => <Search {...props} ref={ref} />),
      SortArrow: forwardRef((props: any, ref: any) => <ArrowDownward {...props} ref={ref} />),
      ThirdStateCheck: forwardRef((props: any, ref: any) => <Remove {...props} ref={ref} />),
      ViewColumn: forwardRef((props: any, ref: any) => <ViewColumn {...props} ref={ref} />)
    };


    return (
      <div className={styles.ungotiApplyLeave}>
        <div >

          <section className="page-section">
            <Grid container spacing={2}>

              {
                <Grid className="manageLeave" item xs={12} sm={12} md={12} lg={12} xl={12}>

                  <MaterialTable
                    title="Pending Leave"
                    icons={tableIcons}
                    columns={columns}
                    data={this.state.listLeaveDetails}
                    actions={[
                      (rowData: LeaveDetails) => ({
                        icon: forwardRef((props: any, ref: any) => <AssignmentTurnedInIcon />),
                        tooltip: 'Accept',
                        onClick: (event, value) => this.openConfirm(true, rowData.Id, 'Approved'),
                      }),
                      (rowData: LeaveDetails) => ({
                        icon: forwardRef((props: any, ref: any) => <DeleteIcon />),
                        tooltip: 'Reject',
                        onClick: (event, value) => this.openConfirm(true, rowData.Id, 'Rejected'),
                      }),
                      {
                        icon: forwardRef((props: any, ref: any) => <VisibilityIcon />),
                        tooltip: 'View',
                        onClick: (event, rowData: LeaveDetails) => this.viewLeave(rowData.Id),
                      }
                    ]}
                    options={{
                      actionsColumnIndex: 5
                    }}
                  />

                </Grid>
              }


            </Grid>
          </section>
        </div>


        <Dialog open={this.state.isview} className="applyLeaveDialog">
          <DialogTitle className="MuiDialogTitle-bg" id="form-dialog-title">
            <Typography component={"h5"}>Leave Details</Typography>
          </DialogTitle>
          <DialogContent>
            <section className="dateRangePicker">
              <Grid container spacing={2} className="datefield">
                <Grid sm={12} md={6}>
                  <Typography component={"p"} className="small-text">
                    FROM DATE
               </Typography>
                  <Typography component={"p"}>
                    {this.state.strFrom}
                  </Typography>
                </Grid>
                <div className="dateRangePicker-totalDays">
                  <span className="number">{this.state.formData.NoofDays} Day(s)</span>
                </div>
                <Grid sm={12} md={6} className={"text-right"}>
                  <Typography component={"p"} className="small-text">
                    TO DATE
               </Typography>
                  <Typography component={"p"}>
                    {this.state.strTo}
                  </Typography>
                </Grid>
              </Grid>
            </section>
            <Grid container>
              <Grid sm={12} >
                <h2>Reason</h2>
                <DialogContentText>
                  {this.state.formData.Detail}
                </DialogContentText>
              </Grid>

              <Grid sm={12} >

              </Grid>
            </Grid>

            {
              this.state.fileName ?
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className="form-group">
                    <label htmlFor="icon-button-file" className="uploadbtn">
                      <IconButton color="primary" aria-label="upload picture" component="span">
                        <PhotoCamera />
                      </IconButton>
                      <label><a href={this.state.formData.DocumentUrl} target="_blank">{this.state.fileName}</a></label>
                    </label>
                  </Grid>
                </Grid>
                : ''
            }



          </DialogContent>
          <DialogActions>
            <Button variant="contained" disableElevation color="default" size="small" onClick={this.closeViewPopup}>
              Cancel
          </Button>
          </DialogActions>
        </Dialog>





        <Dialog open={this.state.isview} className="applyLeaveDialog">
          <DialogTitle className="MuiDialogTitle-bg" id="form-dialog-title">
            <Typography component={"h5"}>Leave Details</Typography>
          </DialogTitle>
          <DialogContent>
            <section className="dateRangePicker">
              <Grid container spacing={2} className="datefield">
                <Grid sm={12} md={6}>
                  <Typography component={"p"} className="small-text">
                    FROM DATE
               </Typography>
                  <Typography component={"p"}>
                    {this.state.strFrom}
                  </Typography>
                </Grid>
                <div className="dateRangePicker-totalDays">
                  <span className="number">{this.state.formData.NoofDays} Day(s)</span>
                </div>
                <Grid sm={12} md={6} className={"text-right"}>
                  <Typography component={"p"} className="small-text">
                    TO DATE
               </Typography>
                  <Typography component={"p"}>
                    {this.state.strTo}
                  </Typography>
                </Grid>
              </Grid>
            </section>
            <Grid container>
              <Grid sm={12} >
                <h2>Reason</h2>
                <DialogContentText>
                  {this.state.formData.Detail}
                </DialogContentText>
              </Grid>

              <Grid sm={12} >

              </Grid>
            </Grid>

            {
              this.state.fileName ?
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className="form-group">
                    <label htmlFor="icon-button-file" className="uploadbtn">
                      <IconButton color="primary" aria-label="upload picture" component="span">
                        <PhotoCamera />
                      </IconButton>
                      <label><a href={this.state.formData.DocumentUrl} target="_blank">{this.state.fileName}</a></label>
                    </label>
                  </Grid>
                </Grid>
                : ''
            }



          </DialogContent>
          <DialogActions>
            <Button variant="contained" disableElevation color="default" size="small" onClick={this.closeViewPopup}>
              Cancel
          </Button>
          </DialogActions>
        </Dialog>





        <Dialog open={this.state.showConfirm} className="applyLeaveDialog">
          <DialogTitle className="MuiDialogTitle-bg" id="form-dialog-title">
            <Typography component={"h5"}>Leave Request</Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container>

              <Grid sm={12} >
                <TextField
                  id="standard-select-currency"
                  error={this.state._errornote}
                  helperText={this.state.errornote}
                  value={this.state.note}
                  onChange={(e) => this.inputChangeHandler.call(this, e)}
                  multiline
                  label="Note"
                  name="Detail"
                  rows="4"
                  placeholder="Please enter  reason for applying leave"
                  className="form-group"
                  variant={"outlined"}
                  size={"small"}
                >
                </TextField>

              </Grid>
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button variant="contained" disableElevation color="default" size="small" onClick={this.openConfirm.bind(this, false)}>
              Cancel
          </Button>
            <Button variant="contained" disableElevation color="primary" size="small" onClick={this.submit}>
              Apply
          </Button>

          </DialogActions>
        </Dialog>

      </div >
    );
  }
}
