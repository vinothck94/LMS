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
import { forwardRef } from 'react';


import Grid from '@material-ui/core/Grid';
import DeleteIcon from '@material-ui/icons/Delete';
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


import MaterialTable, { Column, Icons } from 'material-table';

import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import EditIcon from '@material-ui/icons/Edit';

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

import "alertifyjs";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");

export interface IHRProps {
  graphClient: any;
}

export default class HR extends React.Component<IHRProps, any> {


  constructor(props) {
    super(props);

    this.state = {
      listLeaveBalance: [],
      allLeaveTypes: [],
      departments: [],
      allUserwithDepartments: [],
    };

    alertify.set("notifier", "position", "top-right");

    this.loadDepartment();

    sp.web.currentUser.get().then((userdata) => {
      this.setState({ currentUser: userdata });
      this.loadLeaveTypes();
    });

  }

  public loadDepartment = () => {
    this.props.graphClient
      .api("/users?$select=Department,mail")
      .get()
      .then((response: any) => {
        var departments = this.state.departments;
        departments = [];
        var allUserwithDepartments = response.value;
        for (let index = 0; index < allUserwithDepartments.length; index++) {
          const value = allUserwithDepartments[index];
          var hasdata = departments.filter(c => c == value.department);
          if (hasdata.length == 0) {
            departments.push(value.department);
          }
        }
        this.setState({ allUserwithDepartments: allUserwithDepartments, departments: departments });
      }).catch(error => {
        console.log(error);
      });
  }

  public loadLeaveTypes = () => {
    sp.web.lists
      .getByTitle("LeaveTypes")
      .items
      .filter("Active eq '1'")
      .get()
      .then((res) => {
        var allLeaveTypes = this.state.allLeaveTypes;
        allLeaveTypes = [];
        var columns = this.state.columns;
        columns = [
          { field: 'EmployeeName', title: 'User' }
        ];
        for (let index = 0; index < res.length; index++) {
          const leaveType = res[index];
          allLeaveTypes.push({
            Id: leaveType.Id,
            Title: leaveType.Title,
            DisplayName: leaveType.ScreenName
          });
          columns.push(
            {
              field: leaveType.Title, title: leaveType.ScreenName
            },
            {
              field: leaveType.Title + 'Used', title: leaveType.ScreenName + ' Consumed'
            });
        }
        this.setState({ allLeaveTypes: allLeaveTypes, columns: columns });
        this.loadLeaveBalance();
      });
  }

  public loadLeaveBalance = () => {
    var select = 'Id,EmployeeEmail/Id,EmployeeEmail/FirstName,EmployeeEmail/EMail';
    for (let index = 0; index < this.state.allLeaveTypes.length; index++) {
      const leaveType = this.state.allLeaveTypes[index].Title;
      select = select + ',' + leaveType + ',' + leaveType + 'Used';
    }
    var currentYear = new Date().getFullYear();
    sp.web.lists
      .getByTitle("LeaveBalance")
      .items
      // .filter("Year eq '" + currentYear + "' and EmployeeEmailId ne '" + this.state.currentUser.Id + "'")
      .filter("Year eq '" + currentYear + "'")
      .select(select)
      .expand("EmployeeEmail")
      .get()
      .then((res) => {
        var leaveBalance = this.state.listLeaveBalance;
        leaveBalance = [];
        if (res.length > 0) {
          for (let index = 0; index < res.length; index++) {
            var data = res[index];
            var result = {
              Id: data.Id,
              EmployeeName: data.EmployeeEmail.FirstName,
              EMail: data.EmployeeEmail.EMail
            };
            for (let j = 0; j < this.state.allLeaveTypes.length; j++) {
              const leaveType = this.state.allLeaveTypes[j];
              result[leaveType.Title] = data[leaveType.Title];
              result[leaveType.Title + 'Used'] = data[leaveType.Title + 'Used'];
            }
            leaveBalance.push(result);
          }
        }
        this.setState({ listLeaveBalance: leaveBalance });
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


  public inputChangeHandler = (e) => {
    this.setState({
      totalDays: e.target.value
    });
  }

  public setLeaveType = (event: React.ChangeEvent<any>) => {
    // this.setState({ selLeaveType: event.target.value, totalDays: this.state.formdata[event.target.value] });
    this.setState({ selLeaveType: event.target.value });
    if (event.target.value) {
      this.setState({ errorleavetype: null });
    }
  }

  public closePopup = () => {
    this.setState({ showUpdate: false });
  }

  public editLeaveBalance = (id) => {
    sp.web.lists
      .getByTitle("LeaveBalance")
      .items.getById(id)
      .get()
      .then((response) => {
        this.setState({ formdata: response });
      });

    this.setState({ showUpdate: true, id: id });
  }

  public filterbyDepartment = (event: React.ChangeEvent<any>) => {

  }

  public submit = () => {
    if (!this.state.selLeaveType) {
      this.setState({ errorleavetype: 'Leave type is required' });
      return;
    }
    if (!this.state.totalDays) {
      this.setState({ errorNoofdays: 'No of days is required' });
      return;
    }
    var formdata = this.state.formdata;
    formdata[this.state.selLeaveType] = this.state.totalDays;
    sp.web.lists
      .getByTitle("LeaveBalance")
      .items.getById(this.state.id)
      .update(formdata)
      .then((response) => {
        alertify.success('Leave balance updated');
        this.loadLeaveBalance();
        this.closePopup();
      });
  }

  public render(): React.ReactElement {

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
      <div>
        <Grid container>
          <Grid sm={12} >
            <FormControl variant="outlined" className="form-group" size="small">
              <InputLabel id="standard-select-currency" >Department</InputLabel>
              <Select
                labelId="standard-select-currency"
                id="standard-select-currency"
                onChange={this.filterbyDepartment}
                label="Departments"
              >
                {
                  this.state.departments.map((department) => {
                    return (
                      <MenuItem value={department}>{department}</MenuItem>
                    );
                  })
                }
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <MaterialTable
          title="Leave Balance"
          icons={tableIcons}
          columns={this.state.columns}
          data={this.state.listLeaveBalance}
          actions={[
            (rowData: any) => ({
              icon: forwardRef((props: any, ref: any) => <EditIcon />),
              tooltip: 'Edit',
              onClick: (event, value) => this.editLeaveBalance(rowData.Id),
            })
          ]}
          options={{
            exportButton: true
          }}
        />


        <Dialog open={this.state.showUpdate} className="applyLeaveDialog">
          <DialogTitle className="MuiDialogTitle-bg" id="form-dialog-title">
            <Typography component={"h5"}>Update Leave Balance</Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container>
              <Grid sm={12} >
                <FormControl variant="outlined" className="form-group" size="small" error={this.state.errorleavetype ? true : false}>
                  <InputLabel id="standard-select-currency" >Leave Type</InputLabel>
                  <Select
                    labelId="standard-select-currency"
                    id="standard-select-currency"
                    value={this.state.LeaveTypeId} onChange={this.setLeaveType}
                    label="Leave Type"
                  >
                    {
                      this.state.allLeaveTypes.map((leaveType) => {
                        return (
                          <MenuItem value={leaveType.Title}>{leaveType.DisplayName}</MenuItem>
                        );
                      })
                    }
                  </Select>
                </FormControl>
                <FormHelperText>{this.state.errorleavetype}</FormHelperText>

              </Grid>

              <Grid sm={12} >
                <TextField
                  id="standard-select-currency"
                  error={this.state.errorNoofdays ? true : false}
                  value={this.state.totalDays}
                  onChange={(e) => this.inputChangeHandler.call(this, e)}
                  multiline
                  label="Days"
                  name="Days"
                  placeholder="Please enter no. of days"
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


      </div>
    );
  }
}
