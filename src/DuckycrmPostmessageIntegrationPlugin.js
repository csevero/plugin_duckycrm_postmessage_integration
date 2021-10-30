import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
const PLUGIN_NAME = 'DuckycrmPostmessageIntegrationPlugin';

export default class DuckycrmPostmessageIntegrationPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);

    this.crmRef = React.createRef();
  }

  // helper function for posting messages to the CRM
  updateCRM(profileId) {
    this.crmRef.current.contentWindow.postMessage(
      { id: profileId },
      'https://duckycrm-7409-dev.twil.io',
    );
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    // remove CRMContainer
    flex.AgentDesktopView.Panel2.Content.remove('container');
    // add our own iframe container with a ref
    flex.AgentDesktopView.Panel2.Content.add(
      <iframe
        key="crmIframe"
        ref={this.crmRef}
        src="https://duckycrm-7409-dev.twil.io/spa.html"
        style={{ height: '100vh' }}
      />,
    );

    // post message whenever a new task is selected
    flex.Actions.addListener('beforeSelectTask', (payload) => {
      if (
        payload.task &&
        payload.task.attributes &&
        payload.task.attributes.account_number
      ) {
        this.updateCRM(payload.task.attributes.account_number);
      }
      // no account number found
      else {
        this.updateCRM(null);
      }
    });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`,
      );
      return;
    }
  }
}
