import Command from './Command';

/**
 * Command to set a single value of a data object.
 * @class
 */
export default class SetValueCmd {
    constructor(objId, tagId, field, value, type, rb) {
        this.objId = objId;
        this.tagId = tagId;
        this.field = field;
        this.value = value;
        this.type = type;
        this.rb = rb;

        let obj = rb.getDataObject(objId);
        this.oldValue = obj.getValue(field);
        this.firstExecution = true;
        this.select = true;
    }

    getName() {
        return 'Set value';
    }

    getObjId() {
        return this.objId;
    }

    do() {
        if (!this.firstExecution && this.select) {
            this.rb.selectObject(this.objId, true);
        }
        this.setValue(this.value);
        this.firstExecution = false;
    }

    undo() {
        if (this.select) {
            this.rb.selectObject(this.objId, true);
        }
        this.setValue(this.oldValue);
    }

    setValue(value) {
        let obj = this.rb.getDataObject(this.objId);
        let isShown = this.rb.isSelectedObject(this.objId);
        let elSelector = `#${this.tagId}`;
        obj.setValue(this.field, value, elSelector, isShown);

        if (this.field === 'name') {
            $(`#rbro_menu_item_name${this.objId}`).text(value);
            $(`#rbro_menu_item_name${this.objId}`).attr('title', value);
            this.rb.notifyEvent(obj, Command.operation.rename);
        }
        this.rb.notifyEvent(obj, Command.operation.change, this.field);
    }

    /**
     * Disables selection of the element containing the changed field. By default an element is automatically
     * selected after one of its fields was changed.
     */
    disableSelect() {
        this.select = false;
    }

    /**
     * Returns true if the command can replace the given other command because they target the same field.
     *
     * This information can be useful to avoid separate commands for every keystroke
     * in a text field and generate just one command for the whole changed text instead.
     * @param {Command} otherCmd
     * @returns {boolean}
     */
    allowReplace(otherCmd) {
        return (otherCmd instanceof SetValueCmd && this.type === SetValueCmd.type.text &&
            this.objId === otherCmd.objId && this.tagId === otherCmd.tagId && this.field === otherCmd.field);
    }

    /**
     * Must be called when the command replaces the other command.

     * This must only be called if allowReplace for the same command returned true.
     * @param {Command} otherCmd
     */
    replace(otherCmd) {
        this.oldValue = otherCmd.oldValue;
    }
}

SetValueCmd.type = {
    text: 'text',
    select: 'select',
    file: 'file',
    filename: 'filename',
    checkbox: 'checkbox',
    button: 'button',
    buttonGroup: 'buttonGroup',  // one button inside a group of buttons with only one active button
    color: 'color',
    internal: 'internal'
};
