import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'UngotiApplyLeaveWebPartStrings';
import UngotiApplyLeave from './components/UngotiApplyLeave';
import { IUngotiApplyLeaveProps } from './components/IUngotiApplyLeaveProps';

import { MSGraphClient, HttpClient } from '@microsoft/sp-http';


export interface IUngotiApplyLeaveWebPartProps {
  description: string;
  card: boolean;
  list: boolean;
  cardTitle: string;
  listTitle: string;
}

export default class UngotiApplyLeaveWebPart extends BaseClientSideWebPart<IUngotiApplyLeaveWebPartProps> {

  public render(): void {
    this.context.msGraphClientFactory.getClient()
      .then((_graphClient: MSGraphClient): void => {
        const element: React.ReactElement<IUngotiApplyLeaveProps> = React.createElement(
          UngotiApplyLeave,
          {
            description: this.properties.description,
            siteUrl: this.context.pageContext.web.absoluteUrl,
            card: this.properties.card,
            list: this.properties.list,
            cardTitle: this.properties.cardTitle,
            listTitle: this.properties.listTitle,
            graphClient: _graphClient
          }
        );
        ReactDom.render(element, this.domElement);
      });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Configuration'
          },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('cardTitle', {
                  label: 'Card Title'
                }),
                PropertyPaneTextField('listTitle', {
                  label: 'List Title'
                })
              ]
            },
            {
              groupName: "UI Config",
              groupFields: [
                PropertyPaneCheckbox('card', {
                  checked: false,
                  text: "Card"
                }),
                PropertyPaneCheckbox('list', {
                  checked: false,
                  text: "List"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
