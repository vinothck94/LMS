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

export interface IUngotiApplyLeaveWebPartProps {
  description: string;
  card: boolean;
  list: boolean;
  cardTitle: string;
  listTitle: string;
}

export default class UngotiApplyLeaveWebPart extends BaseClientSideWebPart<IUngotiApplyLeaveWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IUngotiApplyLeaveProps> = React.createElement(
      UngotiApplyLeave,
      {
        description: this.properties.description,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        card: this.properties.card,
        list: this.properties.list,
        cardTitle: this.properties.cardTitle,
        listTitle: this.properties.listTitle,
      }
    );

    ReactDom.render(element, this.domElement);
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
                  checked: true,
                  text: "Card"
                }),
                PropertyPaneCheckbox('list', {
                  checked: true,
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
