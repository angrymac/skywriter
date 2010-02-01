/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var SC = require("sproutcore/runtime").SC;
var env = require("Canon:environment");
var types = require("Types:types");
var Request = require("Canon:request").Request;
var catalog = require("bespin:plugins").catalog;

var tokenizer = catalog.getObject("tokenizer");

/**
 * Command line controller.
 */
exports.cliController = SC.Object.create({
    /**
     * A string containing the current contents of the command line
     */
    input: "",

    /**
     * Called by the UI to execute a command. Assumes that #input is bound to
     * the CLI input text field.
     */
    exec: function() {
        this.executeCommand(this.get("input"));
        this.set("input", "");
    },

    /**
     * Execute a command manually without using the UI
     * @param typed {String} The command to turn into an Instruction and execute
     */
    executeCommand: function(typed) {
        console.log("executeCommand '" + typed + "'");

        if (!typed || typed === "") {
            return;
        }

        var parts = tokenizer(typed);
        var cmdArgs = this._splitCommandAndArgs(parts);

        this._convertTypes(cmdArgs.commandExt, cmdArgs.remainder, function(args) {
            cmdArgs.commandExt.load(function(command) {

                var request = Request.create({
                    command: command,
                    commandExt: cmdArgs.commandExt,
                    typed: typed,
                    args: args
                });

                try {
                    command(env.global, args, request);
                } catch (ex) {
                    // TODO: Some UI?
                    console.group("Error calling command: " + cmdArgs.commandExt.name);
                    console.log("- typed: '", typed, "'");
                    console.log("- arguments: ", args);
                    console.error(ex);
                    console.trace();
                    console.groupEnd();
                }
            });
        });
    },

    /**
     * Convert the passed string array into an args object as specified by the
     * command.params declaration.
     */
    _convertTypes: function(command, remainder, onConvert) {
        var args = {};
        var i = 0; // Which arg are we converting
        var done = 0; // Call onConvert when we're done
        command.params.forEach(function(param) {
            var arg = remainder.length > i ? remainder[i] : null;
            types.fromString(param.type, arg, function(converted) {
                args[param.name] = converted;
                done++;
                if (done == command.params.length) {
                    onConvert(args);
                }
            });
        });
    },

    /**
     * Looks in the catalog for a command extension that matches what has been typed
     * at the command line.
     */
    _splitCommandAndArgs: function(parts) {
        // TODO: Something that doesn't assume no sub-commands:
        parts = parts.slice();
        var initial = parts.shift();
        return {
            commandExt: catalog.getExtensionByKey("command", initial),
            remainder: parts
        };
    }
});
