"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const colors = require("colors");
function CheckForUpdate(current) {
    let re = request('http://registry.npmjs.org/serverhub-mvc');
    re.onRequestResponse = function (res) {
        let response = '';
        res.on('data', data => response += data.toString());
        res.on('end', () => {
            if (response.length > 0) {
                let data = JSON.parse(response);
                let latest = data['dist-tags']['latest'];
                if (latest > current) {
                    console.info(colors.yellow('\n>> Newer version of ServerHub (' + latest + ') is avaliable on npm.js') + '\n   Install with "npm install serverhub-mvc" to get the update.\n');
                }
            }
        });
    };
}
exports.CheckForUpdate = CheckForUpdate;
