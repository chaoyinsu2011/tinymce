import { Pipeline, GeneralSteps } from '@ephox/agar';
import { Step } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyUi from 'ephox/mcagar/api/TinyUi';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('McagarTutorialTest', (success, failure) => {
  var handler = (ed) => () => {
    var content = ed.getContent();
    ed.focus();
    if (content === '<p>tutorial content</p>') {
      ed.setContent('<p>alternate content</p>');
      var paragraph = ed.getBody().childNodes[0];
      ed.selection.setCursorLocation(paragraph, 1);
    } else {
      ed.setContent('<p>tutorial content</p>');
      var target = ed.getBody().childNodes[0];
      ed.selection.select(target);
    }
  };

  var silverSetup = (ed) => {
    ed.ui.registry.addButton('tutorial-button', {
      text: 'tutorial',
      onAction: handler(ed)
    });
  };

  var modernSetup = (ed) => {
    ed.addButton('tutorial-button', {
      text: 'tutorial',
      icon: false,
      onclick: handler(ed)
    });
  };

  var sTestVersion = (version: string, setup) => {
    return TinyLoader.sSetupVersion(version, [], (editor) => {
      var ui = TinyUi(editor);
      var apis = TinyApis(editor);

      return GeneralSteps.sequence([
        ui.sClickOnToolbar('Clicking on button', 'button:contains("tutorial")'),
        apis.sAssertContent('<p>tutorial content</p>'),
        Step.wait(400),
        apis.sAssertSelection([ ], 0, [ ], 1),
        ui.sClickOnToolbar('Clicking on button to change to alternate', 'button:contains("tutorial")'),
        apis.sAssertContent('<p>alternate content</p>'),
        Step.wait(400),
        apis.sAssertSelection([ 0 ], 1, [ 0 ], 1),
        ui.sClickOnToolbar('Clicking on button to change to tutorial again', 'button:contains("tutorial")'),
        apis.sAssertContent('<p>tutorial content</p>'),
        Step.wait(400),
        apis.sAssertSelection([ ], 0, [ ], 1)
      ])
    }, {
      setup,
      menubar: false,
      toolbar: 'tutorial-button',
    });
  };

  Pipeline.async({}, [
    sTestVersion('4.8.x', modernSetup),
    sTestVersion('5.x', silverSetup)
  ], () => success(), failure);
});

