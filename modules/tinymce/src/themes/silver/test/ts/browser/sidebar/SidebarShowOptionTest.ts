import { UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Sidebar } from '@ephox/bridge';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

interface EventLog {
  readonly name: string;
  readonly index: number;
}

describe('browser.tinymce.themes.silver.sidebar.SidebarShowOptionTest', () => {
  const store = TestHelpers.TestStore();
  const settingsFactory = (store: TestHelpers.TestStore) => {
    const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
      const index = Traverse.findIndex(SugarElement.fromDom(api.element())).getOr(-1);
      const entry: EventLog = { name, index };
      store.adder(entry)();
    };

    return {
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed) => {
        ed.ui.registry.addSidebar('sidebarone', {
          tooltip: 'side bar one',
          icon: 'comment',
          onShow: logEvent('sidebarone:show'),
        });
        ed.ui.registry.addSidebar('sidebartwo', {
          tooltip: 'side bar one',
          icon: 'comment',
          onShow: logEvent('sidebartwo:show'),
        });
      }
    };
  };

  const assertNotAnimating = () => UiFinder.notExists(SugarBody.body(), '.tox-sidebar--sliding-growing');

  beforeEach(() => {
    store.clear();
  });

  it('TINY-8710: Show no sidebar on init if not set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store)
    });
    store.assertEq('Asserting initial show of sidebars', []);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a sidebar on init', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store),
      sidebar_show: 'sidebarone'
    });
    assertNotAnimating();
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebarone:show',
        index: 0
      },
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a different sidebar on init', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store),
      sidebar_show: 'sidebartwo'
    });
    assertNotAnimating();
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebartwo:show',
        index: 1
      }
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show no sidebar if the name does not exist', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store)
    });
    store.assertEq('Asserting initial show of sidebars', []);
    McEditor.remove(editor);
  });
});