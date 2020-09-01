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


import Grid from '@material-ui/core/Grid';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
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

import '../../../scss/styles.scss';

import {
  Typography, ButtonGroup,
  ListItem,
  Badge,
  List,
  ListItemText,
  LinearProgress,
  MenuItem,
  Menu
} from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import styles from "./UngotiApplyLeave.module.scss";

import "alertifyjs";

import "../../../ExternalRef/CSS/style.css";
import "../../../ExternalRef/CSS/alertify.min.css";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");

import { IUngotiApplyLeaveState } from './IUngotiApplyLeaveState';

export default class UngotiApplyLeave extends React.Component<IUngotiApplyLeaveProps, IUngotiApplyLeaveState> {

  public deleteId = 0;

  public oldLeaveTypeId = 0;
  public oldNoofDays = 0;
  public txtSelectDate = 'Select Date';

  public leaveColors = [
    'bg-purple',
    'bg-info',
    'bg-pink',
    'bg-success',
  ];

  constructor(props) {
    super(props);

    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });

    alertify.set("notifier", "position", "top-right");

    this.state = {
      page: 0,
      rowsPerPage: 5,
      openAddPopup: false,
      openDeleteConfirm: false,
      listLeaveDetails: [],
      formData: {
        Id: 0,
        ApproverId: 0,
        RequesterId: 0,
        LeaveTypeId: 0,
        From: null,
        To: null,
        NoofDays: 0,
        Detail: '',
        Status: '',
        FromHalf: '1',
        ToHalf: '2',
      },

      allLeaveTypes: [],
      allWeekEndConfig: [],
      allHolidays: [],
      leaveBalance: {},
      currentUser: {},

      openDatePicker: false,
      strFrom: this.txtSelectDate,
      strTo: this.txtSelectDate,
    };

    this.init();

  }

  public init = () => {
    sp.web.currentUser.get().then((userdata) => {
      this.setState({ currentUser: userdata });
      this.loadLeaveBalance();
    });
    this.loadAppliedLeave();
    this.loadLeaveTypes();
    this.loadWeekEndConfig();
    this.loadHolidays();
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
    return paramdate.getFullYear() + '-' + month + '-' + date;
  }

  public loadAppliedLeave = () => {
    sp.web.lists
      .getByTitle("LeaveRequest")
      .items
      .select("Id", "Title", "From", "To", "NoofDays", "Detail", "Status", "LeaveType/Id", "LeaveType/Title")
      .expand("LeaveType")
      .get()
      .then((res) => {
        var lstData = this.state.listLeaveDetails;
        lstData = [];
        for (let index = 0; index < res.length; index++) {
          const leave = res[index];
          lstData.push({
            Id: leave.Id,
            LeaveType: leave.LeaveType.Title,
            LeaveTypeId: leave.LeaveType.Id,
            From: new Date(leave.From),
            To: new Date(leave.To),
            NoofDays: parseFloat(leave.NoofDays),
            Detail: leave.Detail,
            Status: leave.Status
          });
        }
        this.setState({ listLeaveDetails: lstData });
      });
  }

  public loadLeaveTypes = () => {
    sp.web.lists
      .getByTitle("LeaveTypes")
      .items
      .get()
      .then((res) => {
        var allLeaveTypes = this.state.allLeaveTypes;
        allLeaveTypes = [];
        for (let index = 0; index < res.length; index++) {
          const leaveType = res[index];
          allLeaveTypes.push({
            Id: leaveType.Id,
            Title: leaveType.Title,
            DisplayName: leaveType.ScreenName
          });
        }
        this.setState({ allLeaveTypes: allLeaveTypes });
      });
  }

  public loadWeekEndConfig = () => {
    sp.web.lists
      .getByTitle("WeekEndConfig")
      .items
      .filter("Holiday eq '1'")
      .get()
      .then((res) => {
        var allWeekEndConfig = this.state.allWeekEndConfig;
        allWeekEndConfig = [];
        for (let index = 0; index < res.length; index++) {
          const weekend = res[index];
          allWeekEndConfig.push({
            Id: weekend.Id,
            Title: weekend.Title
          });
        }
        this.setState({ allWeekEndConfig: allWeekEndConfig });
      });
  }

  public loadHolidays = () => {
    var currentYear = new Date().getFullYear();
    sp.web.lists
      .getByTitle("Holidays")
      .items
      .filter("Year eq '" + currentYear + "'")
      .get()
      .then((res) => {
        var allHolidays = this.state.allHolidays;
        allHolidays = [];
        for (let index = 0; index < res.length; index++) {
          const holiday = res[index];
          allHolidays.push({
            Id: holiday.Id,
            Date: holiday.Date
          });
        }
        this.setState({ allHolidays: allHolidays });
      });
  }

  public loadLeaveBalance = () => {
    var currentYear = new Date().getFullYear();
    sp.web.lists
      .getByTitle("LeaveBalance")
      .items
      .filter("Year eq '" + currentYear + "' and EmployeeEmailId eq '" + this.state.currentUser.Id + "'")
      .get()
      .then((res) => {
        var leaveBalance = this.state.leaveBalance;
        if (res.length > 0) {
          leaveBalance = res[0];
        }
        this.setState({ leaveBalance: leaveBalance });
      });
  }

  public openPopup = () => {
    this.resetForm();
    this.setState({ openAddPopup: true });
    this.calculateNoOfDays();
  }

  public closePopup = () => {
    this.setState({ openAddPopup: false });
  }

  public resetForm = () => {
    var formData = this.state.formData;
    formData = {
      Id: 0,
      ApproverId: 0,
      RequesterId: 0,
      LeaveTypeId: 0,
      From: null,
      To: null,
      NoofDays: 0,
      Detail: '',
      Status: '',
      FromHalf: '1',
      ToHalf: '2',
    };
    this.setState({ formData: formData, strFrom: this.txtSelectDate, strTo: this.txtSelectDate });
  }

  public setFormHalf = (value) => {
    var formData = this.state.formData;
    formData.FromHalf = value;
    this.setState({ formData: formData });
    this.calculateNoOfDays();
  }

  public setToHalf = (value) => {
    var formData = this.state.formData;
    formData.ToHalf = value;
    this.setState({ formData: formData });
    this.calculateNoOfDays();
  }

  public setLeaveType = (event: React.ChangeEvent<any>) => {
    var formData = this.state.formData;
    formData.LeaveTypeId = parseInt(event.target.value);
    this.setState({ formData: formData });
  }

  public inputChangeHandler = (e) => {
    let formData = this.state.formData;
    formData[e.target.name] = e.target.value;
    this.setState({
      formData
    });
  }

  public dateChangeHandler = (e) => {
    let formData = this.state.formData;
    formData[e.target.name] = new Date(e.target.value);
    this.setState({
      formData
    });
    this.calculateNoOfDays();
  }

  public checkIfHoliday = (value: Date) => {
    for (let index = 0; index < this.state.allHolidays.length; index++) {
      const holiday = this.state.allHolidays[index];
      var date = new Date(holiday.Date).toLocaleDateString();
      if (date == value.toLocaleDateString()) {
        return true;
      }
    }
    return false;
  }

  public checkIfWeekEnd = (value: Date) => {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[value.getDay()];
    for (let index = 0; index < this.state.allWeekEndConfig.length; index++) {
      const weekend = this.state.allWeekEndConfig[index];
      if (weekend.Title == dayName) {
        return true;
      }
    }
    return false;
  }

  public calculateNoOfDays = () => {
    var formData = this.state.formData;
    if (formData.From > formData.To) {
      formData.NoofDays = 0;
      this.setState({ formData: formData });
      return;
    }
    formData.NoofDays = 0;
    var startDate = new Date(formData.From.toLocaleDateString());
    var endDate = new Date(formData.To.toLocaleDateString());
    var isholiday = this.checkIfHoliday(startDate);
    var isweekend = this.checkIfWeekEnd(startDate);
    if (!isholiday && !isweekend) {
      formData.NoofDays = 1;
      if (formData.FromHalf == '2') {
        formData.NoofDays = 0.5;
      }
    }
    startDate.setDate(startDate.getDate() + 1);
    while (startDate <= endDate) {
      var isholiday = this.checkIfHoliday(startDate);
      var isweekend = this.checkIfWeekEnd(startDate);
      if (!isholiday && !isweekend) {
        if (startDate.toLocaleDateString() == endDate.toLocaleDateString()) {
          if (formData.ToHalf == '1') {
            formData.NoofDays = formData.NoofDays + 0.5;
          } else {
            formData.NoofDays = formData.NoofDays + 1;
          }
        } else {
          formData.NoofDays = formData.NoofDays + 1;
        }
      } else if (startDate.toLocaleDateString() == endDate.toLocaleDateString()) {
        if (formData.ToHalf == '1') {
          formData.NoofDays = formData.NoofDays - 0.5;
        }
      }
      startDate.setDate(startDate.getDate() + 1);
    }
    this.setState({ formData: formData });
  }

  public editLeave = (id) => {
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
        };
        var fromDefaultDate = this.formatDate(from);
        var toDefaultDate = this.formatDate(to);
        this.oldLeaveTypeId = response.LeaveTypeId;
        this.oldNoofDays = parseFloat(response.NoofDays);
        this.setState({ formData: formData, strFrom: fromDefaultDate, strTo: toDefaultDate, openAddPopup: true });
      });
  }

  public deleteLeave = (id) => {
    this.deleteId = id;
    this.setState({ openDeleteConfirm: true });
  }

  public submit = () => {
    var formData = this.state.formData;
    if (!formData.LeaveTypeId) {
      alertify.error('Leave type is required');
      return;
    }
    if (!formData.Detail) {
      alertify.error('Detail is required');
      return;
    }
    if (formData.From > formData.To) {
      alertify.error('From date is greater than To date');
      return;
    }
    var leaveBalance = this.state.leaveBalance;
    var selLeaveType = this.state.allLeaveTypes.filter(c => c.Id == formData.LeaveTypeId)[0];
    var selTypeUsed = selLeaveType.Title + 'Used';

    if (formData.Id) {
      if (this.oldLeaveTypeId != formData.LeaveTypeId) {
        var oldLeaveType = this.state.allLeaveTypes.filter(c => c.Id == this.oldLeaveTypeId)[0];
        var strOldTypeUsed = selLeaveType.Title + 'Used';
        leaveBalance[strOldTypeUsed] = parseFloat(leaveBalance[strOldTypeUsed]) - this.oldNoofDays;
      } else {
        leaveBalance[selTypeUsed] = (parseFloat(leaveBalance[selTypeUsed]) - this.oldNoofDays) + '';
      }
    }

    var usedLeave = parseFloat(leaveBalance[selTypeUsed] ? leaveBalance[selTypeUsed] : 0);
    var totalLeave = usedLeave + formData.NoofDays;
    var availableLeave = parseFloat(leaveBalance[selLeaveType.Title]);
    if (totalLeave > availableLeave) {
      alertify.error('Available ' + selLeaveType.Title + ' leave is ' + availableLeave + ', already used ' + usedLeave + ' ' + selLeaveType.Title + ' leave');
      return;
    }
    leaveBalance[selTypeUsed] = totalLeave + '';

    formData.ApproverId = this.state.currentUser.Id;
    formData.RequesterId = this.state.currentUser.Id;

    if (formData.Id) {
      sp.web.lists
        .getByTitle("LeaveRequest")
        .items.getById(formData.Id)
        .update(formData)
        .then((response) => {
          this.updateLeaveBalance(leaveBalance);
          alertify.success('Leave updated successfully');
        });
    } else {
      sp.web.lists
        .getByTitle("LeaveRequest")
        .items.add(formData)
        .then((res) => {
          this.updateLeaveBalance(leaveBalance);
          alertify.success('Leave applied successfully');
        });
    }
  }

  public updateLeaveBalance = (leaveBalance) => {
    sp.web.lists
      .getByTitle("LeaveBalance")
      .items.getById(leaveBalance.Id)
      .update(leaveBalance)
      .then((response) => {
        this.init();
        this.closePopup();
      });
  }

  public closeDelete = () => {
    this.setState({ openDeleteConfirm: false });
  }

  public confirmDelete = () => {
    var leaveData = this.state.listLeaveDetails.filter(c => c.Id == this.deleteId)[0];
    var leaveBalance = this.state.leaveBalance;
    var selLeaveType = this.state.allLeaveTypes.filter(c => c.Id == leaveData.LeaveTypeId)[0];
    var selTypeUsed = selLeaveType.Title + 'Used';
    leaveBalance[selTypeUsed] = (parseFloat(leaveBalance[selTypeUsed]) - leaveData.NoofDays) + '';
    this.updateLeaveBalance(leaveBalance);
    sp.web.lists
      .getByTitle("LeaveRequest")
      .items.getById(this.deleteId)
      .delete()
      .then((response) => {
        this.setState({ openDeleteConfirm: false });
        alertify.success('Leave cancelled successfully');
        this.init();
      });
  }

  public showDatePicker = (value) => {
    this.setState({ openDatePicker: value });
  }

  public setDateRange = (range) => {
    let formData = this.state.formData;
    formData.From = range.startDate;
    formData.To = range.endDate;
    this.setState({
      formData: formData, strFrom: this.formatDate(range.startDate), strTo: this.formatDate(range.endDate)
    });
    this.calculateNoOfDays();
  }

  public render(): React.ReactElement<IUngotiApplyLeaveProps> {

    const columns = [
      { id: 'From', label: 'From', minWidth: 170 },
      { id: 'To', label: 'To', minWidth: 170 },
      { id: 'NoofDays', label: 'No. of days', minWidth: 170 },
      { id: 'Action', label: 'Action', minWidth: 170 },
    ];

    const handleChangePage = (event: unknown, newPage: number) => {
      this.setState({ page: newPage });
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ rowsPerPage: this.state.rowsPerPage + parseInt(event.target.value) });
      this.setState({ page: 0 });
    };

    return (
      <div className={styles.ungotiApplyLeave}>
        <div>
          <div className="page-title">
            <Grid container spacing={2} justify="space-between" >
              <Typography component={'h3'}>
                Types of Leaves
        </Typography>
              <ButtonGroup disableElevation variant="contained" size="small" color="primary">
                <Button size="small" onClick={this.openPopup}>Apply Leave</Button>
                <Button size="small" color="primary">
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
            </Grid>
          </div>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Grid container spacing={2}>

                {
                  this.state.allLeaveTypes.map((leaveType, index) => {

                    var totalLeave = this.state.leaveBalance[leaveType.Title];
                    var usedLeave = this.state.leaveBalance[leaveType.Title + 'Used'];

                    var available = parseFloat(totalLeave) - parseFloat(usedLeave);

                    var cardcolor = "dashboard-card " + this.leaveColors[index];

                    return (
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                        <Paper elevation={0} square={false} className={cardcolor}>
                          <div className="heading-group">
                            <div className={'dashboard-heading-icon dashboard-heading-icon-casuel'}>
                            </div>
                            <div className={'dashboard-heading'}>
                              <Typography component={'h6'}>
                                {leaveType.DisplayName}
                              </Typography>
                              <Typography component={'h2'} className={"card-totalnumber"}>
                                {totalLeave}
                              </Typography>
                            </div>
                          </div>
                          <div className="dashboard-chart"> <LinearProgress className="dashboard-chart-progress" /></div>
                          <div className="dashboard-group">
                            <List className="dashboard-list" >
                              <ListItem>
                                <ListItemText>
                                  Available <Badge>{available}</Badge>
                                </ListItemText>

                              </ListItem>
                              <ListItem>
                                <ListItemText>
                                  Consumed <Badge>{usedLeave}</Badge>
                                </ListItemText>

                              </ListItem>
                              <ListItem>
                                <ListItemText>
                                  Pending <Badge>0</Badge>
                                </ListItemText>

                              </ListItem>

                            </List>

                          </div>

                        </Paper>
                      </Grid>
                    );
                  })
                }



              </Grid>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      this.state.listLeaveDetails.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1}>
                            {columns.map((column) => {
                              if (column.id != 'Action') {
                                var value = row[column.id];
                                if (column.id == 'From' || column.id == 'To') {
                                  var date = new Date(value);
                                  value = this.formatDate(date);
                                }
                                return (
                                  <TableCell key={column.id}>
                                    {value}
                                  </TableCell>
                                );
                              } else {
                                return (
                                  <TableCell key={column.id}>
                                    <Grid container>
                                      <Grid item xs={8}>
                                        <span onClick={this.editLeave.bind(this, row.Id)}><EditIcon /></span>
                                        <span onClick={this.deleteLeave.bind(this, row.Id)}><DeleteIcon /></span>
                                        <span><VisibilityIcon /></span>
                                      </Grid>
                                    </Grid>
                                  </TableCell>
                        ;        )
                              }
                            })}
                          </TableRow>
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={this.state.listLeaveDetails.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </Grid>

          </Grid>
        </div>

        <Dialog open={this.state.openAddPopup} className="applyLeaveDialog" >
          <DialogTitle className="MuiDialogTitle-bg" id="form-dialog-title">
            <Typography component={"h5"}>Leave Request for Employee</Typography>
          </DialogTitle>
          <DialogContent>
            <section className="dateRangePicker">


              <Grid container spacing={2} className="datefield">
                <Grid sm={12} md={6}>
                  <Typography component={"p"} className="small-text" onClick={this.showDatePicker.bind(this, true)}>
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
                  <Typography component={"p"} className="small-text" onClick={this.showDatePicker.bind(this, true)}>
                    TO DATE
               </Typography>

                  <Typography component={"p"}>
                    {this.state.strTo}
                  </Typography>

                </Grid>

                <DateRangePicker
                  open={this.state.openDatePicker}
                  toggle={this.showDatePicker.bind(this, false)}
                  onChange={(range) => this.setDateRange(range)}
                />

              </Grid>


            </section>
            <ButtonGroup color="primary" variant="contained" disableElevation>
              <Button variant={"outlined"}>Full Day</Button>
              <Button variant={"contained"} color={"primary"}>First half</Button>
              <Button variant={"outlined"} color={"primary"}>Second half</Button>

            </ButtonGroup>
            <Grid container>
              <Grid sm={12} >
                {/* <TextField
                  id="standard-select-currency"
                  select
                  label="Select available leave types"
                  className="form-group"
                  variant={"outlined"}
                  size={"small"}
                >
                  <MenuItem>Causel Lave (12)</MenuItem>
                </TextField> */}

                <FormControl variant="outlined">
                  <InputLabel id="standard-select-currency">Leave Type</InputLabel>
                  <Select
                    labelId="standard-select-currency"
                    id="standard-select-currency"
                    value={this.state.formData.LeaveTypeId} onChange={this.setLeaveType}
                    label="Leave Type"
                  >
                    {
                      this.state.allLeaveTypes.map((leaveType) => {
                        return (
                          <MenuItem value={leaveType.Id}>{leaveType.Title}</MenuItem>
                ;        )
                      })
                    }
                  </Select>
                </FormControl>

              </Grid>

              <Grid sm={12} >
                <TextField
                  id="standard-select-currency"
                  value={this.state.formData.Detail}
                  onChange={(e) => this.inputChangeHandler.call(this, e)}
                  multiline
                  label="Note"
                  name="Detail"
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
            <Button variant="contained" disableElevation color="default" size="small" onClick={this.closePopup}>
              Cancel
          </Button>
            <Button variant="contained" disableElevation color="primary" size="small" onClick={this.submit}>
              Apply
          </Button>
          </DialogActions>
        </Dialog>


        <Dialog
          open={this.state.openDeleteConfirm}
          onClose={this.closeDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Leave Cancellation?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Do you want to cancel the leave?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDelete} color="primary">
              No
          </Button>
            <Button onClick={this.confirmDelete} color="primary" autoFocus>
              Yes
          </Button>
          </DialogActions>
        </Dialog>

      </div >
    );
  }
}
