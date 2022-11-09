/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import InlineEditor from "@ckeditor/ckeditor5-editor-inline/src/inlineeditor.js";
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment.js";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote.js";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold.js";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials.js";
import FontBackgroundColor from "@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js";
import FontColor from "@ckeditor/ckeditor5-font/src/fontcolor.js";
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily.js";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize.js";
import Heading from "@ckeditor/ckeditor5-heading/src/heading.js";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight.js";
import HorizontalLine from "@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js";
import HtmlEmbed from "@ckeditor/ckeditor5-html-embed/src/htmlembed.js";
import Image from "@ckeditor/ckeditor5-image/src/image.js";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize.js";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload.js";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic.js";
import Link from "@ckeditor/ckeditor5-link/src/link.js";
import List from "@ckeditor/ckeditor5-list/src/list.js";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed.js";
import MediaEmbedToolbar from "@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar.js";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph.js";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat.js";
import SourceEditing from "@ckeditor/ckeditor5-source-editing/src/sourceediting.js";
import SpecialCharacters from "@ckeditor/ckeditor5-special-characters/src/specialcharacters.js";
import SpecialCharactersCurrency from "@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js";
import SpecialCharactersEssentials from "@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js";
import SpecialCharactersLatin from "@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js";
import SpecialCharactersMathematical from "@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical.js";
import SpecialCharactersText from "@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough.js";
import Subscript from "@ckeditor/ckeditor5-basic-styles/src/subscript.js";
import Superscript from "@ckeditor/ckeditor5-basic-styles/src/superscript.js";
import Table from "@ckeditor/ckeditor5-table/src/table.js";
import TableCaption from "@ckeditor/ckeditor5-table/src/tablecaption.js";
import TableCellProperties from "@ckeditor/ckeditor5-table/src/tablecellproperties";
import TableColumnResize from "@ckeditor/ckeditor5-table/src/tablecolumnresize.js";
import TableProperties from "@ckeditor/ckeditor5-table/src/tableproperties";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar.js";
import TextTransformation from "@ckeditor/ckeditor5-typing/src/texttransformation.js";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline.js";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  toWidget,
  viewToModelPositionOutsideModelElement,
} from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import Command from "@ckeditor/ckeditor5-core/src/command";
import {
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import Indent from "@ckeditor/ckeditor5-indent/src/indent.js";
import IndentBlock from "@ckeditor/ckeditor5-indent/src/indentblock.js";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

class FontFamilyDropdown extends Plugin {
  init() {
    this.editor.ui.componentFactory.add("fontFamilyDropdown", () => {
      const editor = this.editor;
      const t = editor.t;
      const command = editor.commands.get("fontFamily");
      const dropdownView = editor.ui.componentFactory.create("fontFamily");

      dropdownView.buttonView.set("withText", true);

      dropdownView.buttonView.bind("label").to(command, "value", (value) => {
        return value ? value : t("Default");
      });

      return dropdownView;
    });
  }
}

class FontSizeDropdown extends Plugin {
  init() {
    this.editor.ui.componentFactory.add("fontSizeDropdown", () => {
      const editor = this.editor;
      const t = editor.t;

      const command = editor.commands.get("fontSize");
      const dropdownView = editor.ui.componentFactory.create("fontSize");

      dropdownView.buttonView.set("withText", true);

      dropdownView.buttonView.bind("label").to(command, "value", (value) => {
        return value ? value : t("Default");
      });

      return dropdownView;
    });
  }
}

class Placeholder extends Plugin {
  static get requires() {
    return [PlaceholderEditing, PlaceholderUI];
  }
}

class PlaceholderCommand extends Command {
  execute({ value }) {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    editor.model.change((writer) => {
      // Create a <placeholder> elment with the "name" attribute (and all the selection attributes)...
      const placeholder = writer.createElement("placeholder", {
        ...Object.fromEntries(selection.getAttributes()),
        name: value,
      });

      // ... and insert it into the document.
      editor.model.insertContent(placeholder);

      // Put the selection on the inserted element.
      writer.setSelection(placeholder, "on");
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;

    const isAllowed = model.schema.checkChild(
      selection.focus.parent,
      "placeholder"
    );

    this.isEnabled = isAllowed;
  }
}

class PlaceholderUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    const placeholderNames = editor.config.get("placeholderConfig.types");

    // The "placeholder" dropdown must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("placeholder", (locale) => {
      const dropdownView = createDropdown(locale);

      // Populate the list in the dropdown with items.
      addListToDropdown(
        dropdownView,
        getDropdownItemsDefinitions(placeholderNames)
      );

      dropdownView.buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t("Placeholder"),
        tooltip: true,
        withText: true,
      });

      // Disable the placeholder button when the command is disabled.
      const command = editor.commands.get("placeholder");
      dropdownView.bind("isEnabled").to(command);

      // Execute the command when the dropdown item is clicked (executed).
      this.listenTo(dropdownView, "execute", (evt) => {
        editor.execute("placeholder", { value: evt.source.commandParam });
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }
}

function getDropdownItemsDefinitions(placeholderNames) {
  const itemDefinitions = new Collection();

  for (const name of placeholderNames) {
    const definition = {
      type: "button",
      model: new Model({
        commandParam: name,
        label: name,
        withText: true,
      }),
    };

    // Add the item definition to the collection.
    itemDefinitions.add(definition);
  }

  return itemDefinitions;
}

class PlaceholderEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(
      "placeholder",
      new PlaceholderCommand(this.editor)
    );

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, (viewElement) =>
        viewElement.hasClass("placeholder")
      )
    );
    this.editor.config.define("placeholderConfig", {
      types: ["date", "first name", "surname"],
    });
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("placeholder", {
      // Allow wherever text is allowed:
      allowWhere: "$text",

      // The placeholder will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
      isObject: true,

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["name"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: ["placeholder"],
      },
      model: (viewElement, { writer: modelWriter }) => {
        // Extract the "name" from "{name}".
        const name = viewElement.getChild(0).data.slice(1, -1);

        return modelWriter.createElement("placeholder", { name });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem, { writer: viewWriter }) =>
        createPlaceholderView(modelItem, viewWriter),
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem, viewWriter) {
      const name = modelItem.getAttribute("name");

      const placeholderView = viewWriter.createContainerElement("span", {
        class: "placeholder",
      });

      // Insert the placeholder name (as a text).
      const innerText = viewWriter.createText("{" + name + "}");
      viewWriter.insert(
        viewWriter.createPositionAt(placeholderView, 0),
        innerText
      );

      return placeholderView;
    }
  }
}

class OverwriteLanguageDirection extends Plugin {
  static get requires() {
    return [OverwriteLanguageDirectionEditing, OverwriteLanguageDirectionUI];
  }
}

class OverwriteLanguageDirectionCommand extends Command {
  execute({ value }) {
    const editor = this.editor;
    let selection = editor.model.document.selection;
    let range = selection.getFirstRange();
    let originalText = "";

    editor.model.change((writer) => {
      for (const item of range.getItems()) {
        originalText = item.data;
      }

      const ignoreDirection = writer.createElement("ignoreDirection", {
        ...Object.fromEntries(selection.getAttributes()),
        name: value,
        textVal: originalText
      });

      editor.model.insertContent(ignoreDirection);

      writer.setSelection(ignoreDirection, "on");
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;

    const isAllowed = model.schema.checkChild(
      selection.focus.parent,
      "ignoreDirection"
    );

    this.isEnabled = isAllowed;
  }
}

class OverwriteLanguageDirectionUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;

    // The "ignoreDirection" dropdown must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("ignoreDirection", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: t("Apply Left-to-Right"),
        tooltip: true,
        withText: true,
      })

      // Disable the ignoreDirection button when the command is disabled.
      const command = editor.commands.get("ignoreDirection");
      button.bind("isEnabled").to(command);

      // Execute the command when the dropdown item is clicked (executed).
      this.listenTo(button, "execute", (evt) => {
        editor.execute("ignoreDirection", { value: evt.source.commandParam });
        editor.editing.view.focus();
      });

      return button;
    });
  }
}

class OverwriteLanguageDirectionEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(
      "ignoreDirection",
      new OverwriteLanguageDirectionCommand(this.editor)
    );

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, (viewElement) =>
        viewElement.hasClass("ignoreDirection")
      )
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("ignoreDirection", {
      // Allow wherever text is allowed:
      allowWhere: "$text",

      // The ignoreDirection will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
      isObject: true,

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The ignoreDirection can have many types, like date, name, surname, etc:
      allowAttributes: ["name", "textVal"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: ["ignoreDirection"],
      },
      model: (viewElement, { writer: modelWriter }) => {
        // Extract the "name" from "{name}".
        const textVal = viewElement.getChild(0).data;
        const name = "Apply Left-to-Right"
        return modelWriter.createElement("ignoreDirection", { name, textVal });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "ignoreDirection",
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createIgnoreDirectionView(
          modelItem,
          viewWriter
        );

        // Enable widget handling on a ignoreDirection element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "ignoreDirection",
      view: (modelItem, { writer: viewWriter }) =>
        createIgnoreDirectionView(modelItem, viewWriter),
    });

    // Helper method for both downcast converters.
    function createIgnoreDirectionView(modelItem, viewWriter) {
      const name = modelItem.getAttribute("name");
      const textVal = modelItem.getAttribute("textVal");

      const ignoreDirectionView = viewWriter.createContainerElement("span", {
        class: "ignoreDirection",
        dir: "ltr"
      });

      const innerText = viewWriter.createText(textVal);
      viewWriter.insert(
        viewWriter.createPositionAt(ignoreDirectionView, 0),
        innerText
      );

      return ignoreDirectionView;
    }
  }
}

class Editor extends InlineEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
  Alignment,
  BlockQuote,
  Bold,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontFamilyDropdown,
  FontSize,
  FontSizeDropdown,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageResize,
  ImageUpload,
  Italic,
  Link,
  List,
  MediaEmbed,
  MediaEmbedToolbar,
  OverwriteLanguageDirection,
  Paragraph,
  PasteFromOffice,
  Placeholder,
  RemoveFormat,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Indent,
  IndentBlock,
];

// Editor configuration.
Editor.defaultConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "outdent",
      "indent",
      "|",
      "imageUpload",
      "blockQuote",
      "insertTable",
      "mediaEmbed",
      "undo",
      "redo",
      "specialCharacters",
      "fontBackgroundColor",
      "fontColor",
      "fontFamily",
      "fontSize",
      "highlight",
      "htmlEmbed",
      "removeFormat",
      "sourceEditing",
      "underline",
      "superscript",
      "subscript",
      "horizontalLine",
      "strikethrough",
      "alignment",
      "placeholder",
      "ignoreDirection",
    ],
  },
  language: "en",
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableCellProperties",
      "tableProperties",
    ],
  },
  heading: {
    options: [
      {
        model: "heading1",
        view: "h2",
        title: "Heading",
        class: "ck-heading_heading1",
      },
      {
        model: "paragraph",
        title: "Body",
        class: "ck-heading_paragraph",
      },
    ],
  },
};

export default Editor;
