import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';

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


import '../../../scss/styles.scss';
import "alertifyjs";

import "../../../ExternalRef/CSS/style.css";
import "../../../ExternalRef/CSS/alertify.min.css";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");


export default class Holidays extends React.Component<{}, any> {

  constructor(props) {
    super(props);
    this.state = {
      allHolidays: [],
    };
    alertify.set("notifier", "position", "top-right");
    this.loadHolidays();
  }

  public loadHolidays = () => {
    var year = new Date().getFullYear()
    sp.web.lists
      .getByTitle("Holidays")
      .items
      .filter("Year eq '" + year + "'")
      .orderBy('Date')
      .get()
      .then((res) => {
        var holidays = [];
        for (let index = 0; index < res.length; index++) {
          const element = res[index];
          holidays.push({
            Title: element.Title,
            Date: this.formatDate(new Date(element.Date))
          });
        }
        this.setState({ allHolidays: holidays });
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

  public render(): React.ReactElement {
    return (
      <List>
        {
          this.state.allHolidays.map((holiday) => {
            return (
              <ListItem className="list-item">
                <ListItemText primary={holiday.Title} secondary={holiday.Date} />
              </ListItem>
            )
          })
        }
      </List>
    );
  }
}
